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

const SlackSelectComponent = z.object({
    componentId: z.string(),
    type: z.literal("select"),
    label: z.string(),
    options: OptionItems,
});
export type SlackSelectComponent = z.infer<typeof SlackSelectComponent>;

const SlackRadioComponent = z.object({
    componentId: z.string(),
    type: z.literal("radio"),
    label: z.string(),
    options: OptionItems,
});
export type SlackRadioComponent = z.infer<typeof SlackRadioComponent>;

const SlackCheckboxComponent = z.object({
    componentId: z.string(),
    type: z.literal("checkbox"),
    label: z.string(),
    options: OptionItems,
});
export type SlackCheckboxComponent = z.infer<typeof SlackCheckboxComponent>;

const SlackTextInputComponent = z.object({
    componentId: z.string(),
    type: z.literal("textInput"),
    label: z.string(),
    placeholder: z.string().optional(),
    optional: z.boolean().default(false),
    multiline: z.boolean().default(false),
});
export type SlackTextInputComponent = z.infer<typeof SlackTextInputComponent>;

const SlackDescriptionComponent = z.object({
    componentId: z.string(),
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
    submit: z.object({
        label: z.string(),
        invoke: z.string(),
    }),
    cancel: z.object({
        label: z.string(),
    }).optional(),
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
    console.log(config);
});
