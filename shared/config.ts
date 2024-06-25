import { late, z } from "npm:zod";
import { parse } from "jsr:@std/yaml";

const SlackCommandTrigger = z.object({
    type: z.literal("slack/command"),
    command: z.string().startsWith("/"),
    firstStep: z.string(),
});

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

export const ButtonElement = z.object({
    elementId: z.string(),
    type: z.literal("button"),
    label: z.string(),
    invoke: z.string(),
});

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

const SlackOpenModalAction = z.object({
    action: z.literal("slack/openModal"),
    title: z.string(),
    elements: z.array(ModalElement),
    submit: z.object({
        label: z.string(),
        run: z.array(z.string()),
    }),
    cancel: z.object({
        label: z.string(),
    }).optional(),
});
export type SlackOpenModalAction = z.infer<typeof SlackOpenModalAction>;

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
]);

const SlackPostAction = z.object({
    action: z.literal("slack/post"),
    channelId: z.string(),
    elements: z.array(PostElement),
});
export type SlackPostAction = z.infer<typeof SlackPostAction>;

const Definition = z.object({
    name: z.string(),
    items: z.record(
        z.string(),
        z.object({
            label: z.string(),
        }).or(z.undefined()),
    ),
});

const Action = z.discriminatedUnion("action", [
    SlackOpenModalAction,
    SlackPostAction,
]);
export type Action = z.infer<typeof Action>;

const Functions = z.record(z.string(), Action);
type Functions = z.infer<typeof Functions>;

const Config = z.object({
    definitions: z.record(z.string(), Definition.or(z.undefined())),
    integration: z.object({
        slack: z.object({
            enabled: z.boolean(),
            baseChannelId: z.string(),
            channelPrefix: z.string(),
        }),
    }),
    flow: z.object({
        trigger: SlackCommandTrigger,
        functions: Functions,
    }),
});
type Config = z.infer<typeof Config>;

export async function loadConfig(path: string): Promise<Config> {
    const file = await Deno.readTextFile(path);
    return Config.parse(parse(file));
}

Deno.test("loadConfig", async () => {
    const config = await loadConfig("./layers/config.yaml");
    console.log(JSON.stringify(config, null, 2));
});
