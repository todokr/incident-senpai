import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
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

const SlackSelectComponent = z.object({
  type: z.literal("select"),
  blockId: z.string(),
  actionId: z.string(),
  label: z.string(),
  options: OptionItems,
});

const SlackRadioComponent = z.object({
  type: z.literal("radio"),
  blockId: z.string(),
  actionId: z.string(),
  label: z.string(),
  options: OptionItems,
});

const SlackCheckboxComponent = z.object({
  type: z.literal("checkbox"),
  blockId: z.string(),
  actionId: z.string(),
  label: z.string(),
  options: OptionItems,
});

const SlackTextInputComponent = z.object({
  type: z.literal("textInput"),
  blockId: z.string(),
  actionId: z.string(),
  label: z.string(),
  optional: z.boolean().or(z.undefined()),
  multiline: z.boolean().or(z.undefined()),
});

const SlackDescriptionComponent = z.object({
  type: z.literal("description"),
  text: z.string(),
});

const SlackModalAction = z.object({
  action: z.literal("slack/modal"),
  title: z.string(),
  components: z.array(z.discriminatedUnion("type", [
    SlackRadioComponent,
    SlackSelectComponent,
    SlackCheckboxComponent,
    SlackTextInputComponent,
    SlackDescriptionComponent,
  ])),
  nextStep: z.string(),
});

const SlackPostAction = z.object({
  action: z.literal("slack/post"),
  channel: z.string(),
  message: z.string(),
});

const Definition = z.object({
  name: z.string(),
  items: z.record(
    z.string(),
    z.object({
      label: z.string(),
    }),
  ),
});

const Config = z.object({
  definitions: z.record(z.string(), Definition),
  integration: z.object({
    slack: z.object({
      enabled: z.boolean(),
      baseChannelId: z.string(),
      channelPrefix: z.string(),
    }),
  }),
  flow: z.object({
    trigger: SlackCommandTrigger,
    steps: z.record(
      z.string(),
      z.discriminatedUnion("action", [SlackModalAction, SlackPostAction]),
    ),
  }),
});
type Config = z.infer<typeof Config>;

const file = Deno.readTextFileSync("senpai-config.yml");

export const config = Config.parse(parse(file));
console.log(JSON.stringify(config, null, 2));
