import { z } from "npm:zod";
import { parse } from "jsr:@std/yaml";

const OptionItems = z.record(
  z.string(),
  z.object({
    label: z.string(),
  }),
);
export type OptionItems = z.infer<typeof OptionItems>;

const PlainSelectElement = z.object({
  elementId: z.string(),
  type: z.literal("select"),
  label: z.string(),
  options: OptionItems,
});
export type PlainSelectElement = z.infer<typeof PlainSelectElement>;

const ChannelSelectElement = z.object({
  elementId: z.string(),
  type: z.literal("channelSelect"),
  label: z.string(),
});
export type ChannelSelectElement = z.infer<typeof ChannelSelectElement>;

const UserSelectElement = z.object({
  elementId: z.string(),
  type: z.literal("userSelect"),
  label: z.string(),
});
export type UserSelectElement = z.infer<typeof UserSelectElement>;

const RadioElement = z.object({
  elementId: z.string(),
  type: z.literal("radio"),
  label: z.string(),
  options: OptionItems,
});
export type RadioElement = z.infer<typeof RadioElement>;

const CheckboxElement = z.object({
  elementId: z.string(),
  type: z.literal("checkbox"),
  label: z.string(),
  options: OptionItems,
});
export type CheckboxElement = z.infer<typeof CheckboxElement>;

const TextInputElement = z.object({
  elementId: z.string(),
  type: z.literal("textInput"),
  label: z.string(),
  placeholder: z.string().optional(),
  optional: z.boolean().default(false),
  multiline: z.boolean().default(false),
});
export type TextInputElement = z.infer<typeof TextInputElement>;

const DateTimePickerElement = z.object({
  elementId: z.string(),
  type: z.literal("dateTimePicker"),
  label: z.string(),
});
export type DateTimePickerElement = z.infer<typeof DateTimePickerElement>;

const HeaderElement = z.object({
  type: z.literal("header"),
  text: z.string(),
});
export type HeaderElement = z.infer<typeof HeaderElement>;

const TextElement = z.object({
  type: z.literal("text"),
  text: z.string(),
});
export type TextElement = z.infer<
  typeof TextElement
>;

const NoteElement = z.object({
  type: z.literal("note"),
  text: z.string(),
});
export type NoteElement = z.infer<typeof NoteElement>;

const DefinitionListElement = z.object({
  type: z.literal("dl"),
  items: z.record(z.string(), z.string()),
});
export type DefinitionListElement = z.infer<typeof DefinitionListElement>;

export const ButtonElement = z.object({
  elementId: z.string(),
  type: z.literal("button"),
  label: z.string(),
  invoke: z.string(),
});
export type ButtonElement = z.infer<typeof ButtonElement>;

const ModalElement = z.discriminatedUnion("type", [
  PlainSelectElement,
  ChannelSelectElement,
  UserSelectElement,
  RadioElement,
  CheckboxElement,
  TextInputElement,
  DateTimePickerElement,
  HeaderElement,
  TextElement,
  NoteElement,
]);
export type ModalElement = z.infer<typeof ModalElement>;

const SlackOpenModalFunction = z.object({
  name: z.string(),
  action: z.literal("slack/openModal"),
  title: z.string(),
  elements: z.array(ModalElement),
  submit: z.object({
    label: z.string().optional(),
  }),
  cancel: z.object({
    label: z.string(),
  }).optional(),
  invoke: z.array(z.string()),
});
export type SlackOpenModalFunction = z.infer<typeof SlackOpenModalFunction>;

const PostElement = z.discriminatedUnion("type", [
  PlainSelectElement,
  ChannelSelectElement,
  UserSelectElement,
  RadioElement,
  CheckboxElement,
  TextInputElement,
  DateTimePickerElement,
  HeaderElement,
  TextElement,
  NoteElement,
  ButtonElement,
  DefinitionListElement,
]);
export type PostElement = z.infer<typeof PostElement>;

const SlackPostFunction = z.object({
  name: z.string(),
  action: z.literal("slack/post"),
  channelId: z.string(),
  elements: z.array(PostElement),
});
export type SlackPostFunction = z.infer<typeof SlackPostFunction>;

const Definition = z.object({
  name: z.string(),
  items: z.record(
    z.string(),
    z.object({
      label: z.string(),
    }).or(z.undefined()),
  ),
});

const SlackCommandTrigger = z.object({
  type: z.literal("slack/command"),
  invoke: z.string(),
});
type SlackCommandTrigger = z.infer<typeof SlackCommandTrigger>;
type Trigger = SlackCommandTrigger;

const FlowFunction = z.discriminatedUnion("action", [
  SlackOpenModalFunction,
  SlackPostFunction,
]);
export type FlowFunction = z.infer<typeof FlowFunction>;

const Functions = z.array(FlowFunction).refine((fns) => {
  const names = new Set<string>();
  for (const fn of fns) {
    if (names.has(fn.name)) {
      return false;
    }
    names.add(fn.name);
  }
  return true;
}, { message: "function names must be unique" })
  .refine((fns) => {
    const notFound = fns.flatMap((fn) => {
      const invokes = fn.action === "slack/openModal" ? fn.invoke : [];
      return invokes
        .filter((invoke) => !fns.some((x) => x.name === invoke))
        .map((invoke) => ({ name: fn.name, invoke }));
    });
    return notFound.length === 0;
  }, {
    message: "Function specified in invoke not found",
  });

type Functions = z.infer<typeof Functions>;

const Flow = z.object({
  trigger: SlackCommandTrigger,
  functions: Functions,
}).refine((flow) => {
  const fnNames = flow.functions.map((fn) => fn.name);
  return fnNames.includes(flow.trigger.invoke);
}, { message: 'Function specified in "flow.trigger.invoke" not found' });

const ConfigSchema = z.object({
  definitions: z.record(z.string(), Definition.or(z.undefined())),
  integration: z.object({
    slack: z.object({
      enabled: z.boolean(),
      baseChannelId: z.string(),
      channelPrefix: z.string(),
    }),
  }),
  flow: Flow,
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

  fn(name: string): FlowFunction | undefined {
    return this._config.flow.functions.find((fn) => fn.name === name);
  }

  nextFns(callbackId: string): FlowFunction[] {
    const invokerFn = this.fn(
      callbackId,
    ) as SlackOpenModalFunction;
    return invokerFn.invoke
      .map((x) => this.fn(x))
      .filter((x) => x !== undefined)
      .map((x) => x!);
  }

  static async load(path: string): Promise<Config> {
    const file = await Deno.readTextFile(path);
    const parsed = ConfigSchema.parse(parse(file));
    return new Config(parsed);
  }
}

Deno.test("loadConfig", async () => {
  const config = await Config.load("./layers/config.yaml");
  console.log(JSON.stringify(config, null, 2));
});
