import { readFileSync } from "node:fs";
import { z } from "zod";
import { parse } from "yaml";

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

const SlackSelectComponent = z.object({
    type: z.literal("select"),
    blockId: z.string(),
    actionId: z.string(),
    label: z.string(),
    options: OptionItems,
});
export type SlackSelectComponent = z.infer<typeof SlackSelectComponent>;

const SlackRadioComponent = z.object({
    type: z.literal("radio"),
    blockId: z.string(),
    actionId: z.string(),
    label: z.string(),
    options: OptionItems,
});
export type SlackRadioComponent = z.infer<typeof SlackRadioComponent>;

const SlackCheckboxComponent = z.object({
    type: z.literal("checkbox"),
    blockId: z.string(),
    actionId: z.string(),
    label: z.string(),
    options: OptionItems,
});
export type SlackCheckboxComponent = z.infer<typeof SlackCheckboxComponent>;

const SlackTextInputComponent = z.object({
    type: z.literal("textInput"),
    blockId: z.string(),
    actionId: z.string(),
    label: z.string(),
    placeholder: z.string().optional(),
    optional: z.boolean().default(false),
    multiline: z.boolean().default(false),
});
export type SlackTextInputComponent = z.infer<typeof SlackTextInputComponent>;

const SlackDescriptionComponent = z.object({
    type: z.literal("description"),
    text: z.string(),
});
export type SlackDescriptionComponent = z.infer<
    typeof SlackDescriptionComponent
>;

const SlackComponent = z.discriminatedUnion("type", [
    SlackRadioComponent,
    SlackSelectComponent,
    SlackCheckboxComponent,
    SlackTextInputComponent,
    SlackDescriptionComponent,
]);
export type SlackComponent = z.infer<typeof SlackComponent>;

const SlackModalAction = z.object({
    action: z.literal("slack/openModal"),
    title: z.string(),
    components: z.array(SlackComponent),
    submit: z.string().optional(),
    cancel: z.string().optional(),
    nextStep: z.string(),
});
export type SlackOpenModalAction = z.infer<typeof SlackModalAction>;

const SlackPostAction = z.object({
    action: z.literal("slack/post"),
    channelId: z.string(),
    message: z.string(),
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
    SlackModalAction,
    SlackPostAction,
]);
export type Action = z.infer<typeof Action>;

const Steps = z.record(z.string(), Action);
type Steps = z.infer<typeof Steps>;

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
        steps: Steps,
    }),
});
type Config = z.infer<typeof Config>;

export function loadConfig(path: string): Config {
    const file = readFileSync(path, "utf-8");
    const config = Config.parse(parse(file));
    console.info(JSON.stringify(config, null, 2));
    return config;
}
