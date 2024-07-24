import { parse } from "jsr:@std/yaml";
import { z } from "npm:zod";
import { Flow, Trigger } from "./flow.ts";
import { CustomField, StdField } from "./field.ts";
import { CreateIncidentFunction, Function } from "./functions.ts";
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

  get createIncidentFunction(): CreateIncidentFunction {
    const trigger = this._config.flow.trigger;
    return this.findFunction(trigger.invoke) as CreateIncidentFunction;
  }

  findFunction(name: string): Function | undefined {
    return this._config.flow.function.find((fn) => fn.name === name);
  }

  /** get next functions to be invoked after the function with the given callbackId */
  nextFunctions(callbackId: string): Function[] {
    const invokerFn = this.findFunction(callbackId); // callbackId is the name of the function
    if (!invokerFn) {
      throw new Error(`Function with name "${callbackId}" not found`);
    }

    // For now, only "inc/createIncident" functions can invoke other functions
    if (invokerFn.action !== "inc/createIncident") {
      throw new Error(
        `Function with name "${callbackId}" is not a "inc/createIncident" function. Only "inc/createIncident" functions can invoke other functions.`,
      );
    }

    return invokerFn.invoke
      .map((x) => this.findFunction(x))
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
      // For now, only "inc/createIncident" functions have fillField elements
      if (fn.action === "inc/createIncident") {
        fn.modal.elements
          .filter((element) => element.type === "fillField")
          .map((element) => element as FillFieldElement)
          .forEach(validate);
      }
    };

    config.flow.function.forEach(fillFieldRefInFn);
  }
}
