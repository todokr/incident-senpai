import type {
  SlashCommand,
  ViewClosedAction,
  ViewSubmitAction,
} from "npm:@slack/bolt";
import { WebClient } from "npm:@slack/web-api";
import { Config, type FlowFunction } from "../shared/config.ts";
import { toModalView } from "../shared/blockkit/modal.ts";
import { toPost } from "../shared/blockkit/post.ts";

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
    await exec(fn, req.body.trigger_id);
  }
  if (isModalSubmission(req)) {
    const nextFns = config.nextFns(req.body.view.callback_id);
    await Promise.all(nextFns.map((fn) => exec(fn, req.body.trigger_id)));
    return { ok: true };
  }

  return {
    ok: true,
    body: {
      text: "ok",
    },
  };
}

async function exec(
  fn: FlowFunction,
  triggerId: string,
) {
  switch (fn.action) {
    case "slack/openModal": {
      const modalOpen = {
        view: toModalView(fn),
        trigger_id: triggerId,
      };
      return await slackClient.views.open(modalOpen);
    }
    case "slack/post": {
      const post = toPost(fn);
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
