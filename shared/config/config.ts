import { parse } from "jsr:@std/yaml";
import { z } from "npm:zod";
import { Flow, Trigger } from "./flow.ts";
import { CustomField, StdField } from "./field.ts";
import { Function } from "./functions.ts";
import { Integration } from "./integrations.ts";
import { NotificationGroups, FallbackNotificationPolicy, NotificationPolicies } from "./notification.ts";
import { FillFieldElement } from "../model/element.ts";

const ConfigSchema = z.object({
  integration: Integration,
  stdField: StdField,
  customField: CustomField,
  flow: Flow,
  notificationGroups: NotificationGroups,
  notificationPolicies: NotificationPolicies,
  fallbackNotificationPolicy: FallbackNotificationPolicy,
});
type ConfigSchema = z.infer<typeof ConfigSchema>;

export class Config {
  private _config: ConfigSchema;
  private constructor(private input: unknown) {
    const parsed = ConfigSchema.parse(input);
    this.validateFillField(parsed);
    this._config = parsed
  }

  get trigger(): Trigger {
    return this._config.flow.trigger;
  }

  fn(name: string): Function | undefined {
    return this._config.flow.function.find((fn) => fn.name === name);
  }

  nextFns(callbackId: string): Function[] {
    const invokerFn = this.fn(callbackId);
    if (!invokerFn) {
      throw new Error(`Function with name "${callbackId}" not found`);
    }
    if (invokerFn.action !== "slack/openModal") {
      throw new Error(
        `Function with name "${callbackId}" is not a slack/openModal function. Only slack/openModal functions can invoke other functions.`,
      );
    }

    return invokerFn.invoke
      .map((x) => this.fn(x))
      .filter((x) => x !== undefined)
      .map((x) => x!);
  }

  static async load(path: string): Promise<Config> {
    const file = await Deno.readTextFile(path);
    const rawConfig = parse(file);
    return new Config(rawConfig);
  }

  /** validate if `fillField` element refers existing field */
  private validateFillField(config: ConfigSchema): void {
    const stdFieldNames = Object.keys(config.stdField);
    const customFieldNames = Object.keys(config.customField);

    const validate = (elem: FillFieldElement) => {
      const [kind, key] = elem.field.split(".");
      if (kind !== "std" && kind !== "custom") {
        throw new Error(`Invalid field kind "${kind}": ${elem.field}`);
      }
      if (kind === "std") {
        if (!stdFieldNames.includes(key)) {
          throw new Error(`Std field "${elem.field}" not found. Available std fields: ${stdFieldNames.join(", ")}`);
        }
      } else if (kind === "custom") {
        if (!customFieldNames.includes(key)) {
          throw new Error(`Custom field "${elem.field}" not found. Available custom fields: ${customFieldNames.join(", ")}`);
        }
      }

      return {
        ...elem,
        kind,
        key
      }
    };

    const fillFieldRefInFn = (fn: Function) => {
      if (fn.action === "slack/openModal") {
        fn.elements
          .filter((element) => element.type === "fillField")
          .map((element) => element as FillFieldElement)
          .forEach(validate);
      }
    };

    config.flow.function.forEach(fillFieldRefInFn);
  }
}
