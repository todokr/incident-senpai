import { parse } from "jsr:@std/yaml";
import { z } from "npm:zod";
import { Flow, Trigger } from "./flow.ts";
import { CustomField, StdField } from "./field.ts";
import { Function } from "./functions.ts";
import { Integration } from "./integrations.ts";
import { NotificationGroups, FallbackNotificationPolicy, NotificationPolicies } from "./notification.ts";

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
    this._config = ConfigSchema.parse(input);
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
}
