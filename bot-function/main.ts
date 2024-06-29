import type {
  SlashCommand,
  ViewClosedAction,
  ViewStateValue,
  ViewSubmitAction,
} from "npm:@slack/bolt";
import { WebClient } from "npm:@slack/web-api";
import { InputBlock } from "npm:@slack/types";
import { Config, type FlowFunction } from "../shared/config.ts";
import { toModalView } from "../shared/blockkit/modal.ts";
import { toPost } from "../shared/blockkit/post.ts";
import { mapRecord } from "../shared/helper.ts";

const token = Deno.env.get("SLACK_BOT_TOKEN");
if (!token) {
  throw new Error("missing SLACK_BOT_TOKEN");
}
const slackClient = new WebClient(token);

export async function main(req: BotRequest): Promise<BotResponse> {
  if (isChallenge(req)) {
    return {
      ok: true,
      body: {
        challenge: req.body.challenge,
      },
    };
  }

  const config = await Config.load("./layers/config.yaml");

  if (isSlashCommand(req)) {
    const fn = config.fn(config.trigger.invoke);
    if (!fn) throw new Error("no function found");
    const input = inputFromSlashCommand(req.body);
    await exec(fn, input);
  }
  if (isModalSubmission(req)) {
    const nextFns = config.nextFns(req.body.view.callback_id);
    const input = inputFromModal(req.body);
    console.log("input", input);
    await Promise.all(nextFns.map((fn) => exec(fn, input)));
    return { ok: true };
  }

  return {
    ok: true,
    body: {
      text: "ok",
    },
  };
}

function inputFromSlashCommand(req: SlashCommand): FunctionInput {
  return {
    triggerId: req.trigger_id,
    user: {
      id: req.user_id,
      name: req.user_name,
    },
    values: {
      "command": { value: req.command },
      "text": { value: req.text },
    },
  };
}

function inputFromModal(req: ViewSubmitAction): FunctionInput {
  const values = mapRecord(req.view.state.values, ([blockId, action]) => {
    // blockId === actionId. eg:
    // "selectTriage": { <- blockId
    //    "selectTriage": { <- actionId
    //      "type": "radio_buttons",
    //        "selected_option": {
    const value: ViewStateValue = action[blockId]; //
    return [blockId, extractInputValue(value)];
  });

  return {
    triggerId: req.trigger_id,
    user: {
      id: req.user.id,
      name: req.user.name,
    },
    values,
  };
}

type InputElementType = InputBlock["element"]["type"];
/**
 * Extracts the value from a ViewStateValue object and returns it as a FunctionInputValue object.
 * @param value - The ViewStateValue object to extract the value from.
 * @returns The extracted value as a FunctionInputValue object.
 */
function extractInputValue(
  value: ViewStateValue,
): FunctionInputValue | FunctionInputValue[] {
  const type = value.type as InputElementType;
  switch (type) {
    case "radio_buttons":
    case "static_select":
    case "channels_select":
    case "users_select":
    case "external_select":
      return {
        label: value.selected_option?.text.text,
        value: value.selected_option?.value,
      };
    case "datepicker":
      return {
        label: value.selected_date ?? undefined,
        value: value.selected_date ?? undefined,
      };
    case "timepicker":
      return {
        label: value.selected_time ?? undefined,
        value: value.selected_time ?? undefined,
      };
    case "multi_channels_select":
      return {
        label: value.selected_channels?.join(", "),
        value: value.selected_channels?.join(", "),
      };
    case "multi_users_select":
      return {
        label: value.selected_users?.join(", "),
        value: value.selected_users?.join(", "),
      };
    case "checkboxes":
    case "multi_static_select":
    case "multi_external_select":
    case "multi_conversations_select":
      return value.selected_options?.map((option) => ({
        label: option.text.text as string,
        value: option.value,
      })) ?? [];
    default:
      return {
        label: value.value ?? undefined,
        value: value.value ?? undefined,
      };
  }
}

export type FunctionInput = {
  triggerId: string;
  user?: {
    id: string;
    name: string;
  };
  values: {
    [key: string]: FunctionInputValue | FunctionInputValue[];
  };
};
type FunctionInputValue = { label?: string; value?: string };

async function exec(
  fn: FlowFunction,
  input: FunctionInput,
) {
  switch (fn.action) {
    case "slack/openModal": {
      const modalOpen = {
        view: toModalView(fn),
        trigger_id: input.triggerId,
      };
      return await slackClient.views.open(modalOpen);
    }
    case "slack/post": {
      const post = toPost(fn, input);
      return await slackClient.chat.postMessage(post);
    }
  }
}

export type BotRequest = {
  path: string;
  // deno-lint-ignore no-explicit-any
  body: { [key: string]: any };
};
export type ChallengeRequest = {
  path: string;
  body: { type: "url_verification"; challenge: string };
};
export function isChallenge(req: BotRequest): req is ChallengeRequest {
  return req.body.type && req.body.type === "url_verification";
}

export type SlashCommandRequest = {
  path: string;
  body: SlashCommand;
};
export function isSlashCommand(req: BotRequest): req is SlashCommandRequest {
  return "command" in req.body;
}
export type ModalSubmissionRequest = {
  path: string;
  body: ViewSubmitAction;
};
export function isModalSubmission(
  req: BotRequest,
): req is ModalSubmissionRequest {
  return req.body.type === "view_submission";
}

export type ModalClosedRequest = {
  path: string;
  body: ViewClosedAction;
};
export function isModalClosed(req: BotRequest): req is ModalClosedRequest {
  return req.body.type === "view_closed";
}

export type BotResponse = {
  ok: boolean;
  // deno-lint-ignore no-explicit-any
  body?: Record<string, any>;
};
