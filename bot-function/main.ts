import { type ViewsOpenArguments, WebClient } from "npm:@slack/web-api";
import type {
    BlockAction,
    BlockButtonAction,
    SlashCommand,
    TeamJoinEvent,
    ViewSubmitAction,
} from "npm:@slack/bolt";
import { loadConfig } from "../shared/config.ts";
import { toModalView } from "./modal.ts";

const token = Deno.env.get("SLACK_BOT_TOKEN");
if (!token) {
    throw new Error("missing SLACK_BOT_TOKEN");
}
const slackClient = new WebClient(token);

export async function main(req: BotRequest): Promise<BotResponse> {
    /* return {
        ok: true,
        body: {
            challenge: req.body.challenge,
        },
    }; */
    const config = await loadConfig("./layers/config.yaml");

    await slackClient.views.open({
        trigger_id: req.body.trigger_id,
        view: {
            type: "modal",
            callback_id: "view-id",
            title: {
                type: "plain_text",
                text: "My App",
            },
            submit: {
                type: "plain_text",
                text: "Submit",
            },
            blocks: [
                {
                    type: "section",
                    block_id: "section-1",
                    text: {
                        type: "mrkdwn",
                        text: "Welcome to a modal with _blocks_",
                    },
                    accessory: {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Click me!",
                        },
                        action_id: "button-1",
                    },
                },
                {
                    type: "input",
                    block_id: "input-1",
                    label: {
                        type: "plain_text",
                        text: "What are your hopes and dreams?",
                    },
                    element: {
                        type: "plain_text_input",
                        action_id: "dreamy_input",
                    },
                },
            ],
        },
    });

    return {
        ok: true,
        body: req,
    };
}

export type BotRequest = {
    path: string;
    // deno-lint-ignore no-explicit-any
    body: { [key: string]: any };
};
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

// deno-lint-ignore no-explicit-any
export type BotResponse = {
    ok: boolean;
    body: Record<string, any>;
};
