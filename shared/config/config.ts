import { parse } from "jsr:@std/yaml";
import { z } from "npm:zod";
import { Definitions } from "./definitions.ts";
import { Flow, Trigger } from "./flow.ts";
import { Function } from "./functions.ts";
import { Integrations } from "./integrations.ts";
import { NotificationGroups, NotificationPolicies } from "./notification.ts";

const ConfigSchema = z.object({
  integrations: Integrations,
  definitions: Definitions,
  flow: Flow,
  notificationGroups: NotificationGroups,
  notificationPolicies: NotificationPolicies,
  fallbackNotificationPolicy: NotificationGroups,
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
    return this._config.flow.functions.find((fn) => fn.name === name);
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
    const parsed = ConfigSchema.parse(rawConfig);

    return new Config(parsed);
  }
}
