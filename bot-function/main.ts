import { decodeBase64 } from "jsr:@std/encoding/base64";
import { APIGatewayProxyEventV2 } from "https://deno.land/x/lambda@1.44.4/mod.ts";
import { parse } from "node:querystring";
import type {
  SlashCommand,
  ViewStateValue,
  ViewSubmitAction,
} from "npm:@slack/bolt";
import type { InputBlock } from "npm:@slack/types";
import { Config } from "../shared/config/config.ts";
import { mapRecord } from "../shared/helper.ts";
import {
CreateIncidentInput,
  Executor,
  OpenIncidentFormInput,
  type FunctionInputValue,
} from "./executor.ts";
import { start } from "../shared/lambda-entrypoint.ts";

const SlackToken = Deno.env.get("SLACK_BOT_TOKEN");
if (!SlackToken) {
  throw new Error("SLACK_BOT_TOKEN is not defined");
}
const QueueUrl = Deno.env.get("ASYNC_TASK_QUEUE_URL");
if (!QueueUrl) {
  throw new Error("ASYNC_TASK_QUEUE_URL is not defined");
}

const executor = new Executor(SlackToken, QueueUrl);

await start(main);

export async function main(
  rawRequest: APIGatewayProxyEventV2,
): Promise<BotResponse> {
  const body = parseRequestBody(
    getRawBody(rawRequest),
    rawRequest.headers["content-type"],
  );
  const req = { body };
  if (isChallenge(req)) {
    return {
      ok: true,
      body: {
        challenge: req.body.challenge,
      },
    };
  }

  const config = await Config.load("./layers/config.yaml");

  if (isStartResponseTrigger(req)) {
    const input = openIncidentFormInput(req.body);
    await executor.openIncidentForm(config.createIncidentFunction, input);
  }
  if (isCreateIncidentSubmission(config, req)) {
    const input = createIncidentInput(req.body);
    await executor.createIncident(input);
    return { ok: true };
  }

  return {
    ok: true,
    body: {
      text: "ok",
    },
  };
}

function openIncidentFormInput(req: SlashCommand): OpenIncidentFormInput {
  return {
    triggerId: req.trigger_id,
    user: {
      id: req.user_id,
      name: req.user_name,
    }
  };
}

function createIncidentInput(req: ViewSubmitAction): CreateIncidentInput {
  const values = mapRecord(req.view.state.values, ([blockId, action]) => {
    // blockId === actionId
    // eg:
    // "selectTriage": { <- blockId
    //    "selectTriage": { <- actionId
    //      "type": "radio_buttons",
    //        "selected_option": {
    req.view.state.values
    const value: ViewStateValue = action[blockId];
    // TODO: extract std & custom field value from value
    return [blockId, extractInputValue(value)];
  });

  return {
    id: crypto.randomUUID(),
    title: "todo:from-format-string",
    description: values.description.value,
    reporter: {
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

export type BotRequest = {
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
export function isStartResponseTrigger(req: BotRequest): req is SlashCommandRequest {
  return "command" in req.body;
}
export type ModalSubmissionRequest = {
  path: string;
  body: ViewSubmitAction;
};

function isCreateIncidentSubmission(config: Config, req: BotRequest) {
  const invoked = config.findFunction(req.body.view.callback_id)!;
  const isCreation = invoked.action === "inc/createIncident";
  return req.body.type === "view_submission" && isCreation;
}

export type BotResponse = {
  ok: boolean;
  // deno-lint-ignore no-explicit-any
  body?: Record<string, any>;
};

function getRawBody(event: APIGatewayProxyEventV2): string {
  if (typeof event === "undefined" || event.body == null) {
    return "";
  }
  if (event.isBase64Encoded) {
    return new TextDecoder().decode(decodeBase64(event.body));
  }
  return event.body;
}

// from: https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts
function parseRequestBody(
  stringBody: string,
  contentType: string | undefined,
  // deno-lint-ignore no-explicit-any
): any {
  if (contentType === "application/x-www-form-urlencoded") {
    const parsedBody = parse(stringBody);
    if (typeof parsedBody.payload === "string") {
      return JSON.parse(parsedBody.payload);
    }
    return parsedBody;
  }
  if (contentType === "application/json") {
    return JSON.parse(stringBody);
  }

  console.warn(`Unexpected content-type detected: ${contentType}`);
  try {
    // Parse this body anyway
    return JSON.parse(stringBody);
  } catch (e) {
    console.error(
      `Failed to parse body as JSON data for content-type: ${contentType}`,
    );
    throw e;
  }
}
