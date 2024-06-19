import { App, AwsLambdaReceiver } from "@slack/bolt";
import type {
  AwsCallback,
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";
import type { WebClient } from "@slack/web-api";
import { SQSClient } from "@aws-sdk/client-sqs";
import {
  type Action,
  loadConfig,
  type SlackOpenModalAction,
} from "@incident-senpai/lib/config";
import { toModalView } from "./modal";

// Read environment variables
// ------------------------------------------------------------------------------------
const signingSecret = process.env.SLACK_SIGNING_SECRET;
if (!signingSecret) {
  throw new Error("SLACK_SIGNING_SECRET is not defined");
}

const token = process.env.SLACK_BOT_TOKEN;
if (!token) {
  throw new Error("SLACK_BOT_TOKEN is not defined");
}

const configPath = process.env.SENPAI_CONFIG_PATH ?? "senpai-config.yaml";
export const CallBackIdPrefix = "incidentSenpai_";

// Setup from config
// ------------------------------------------------------------------------------------
const { definitions, flow, integration } = loadConfig(configPath);

const receiver = new AwsLambdaReceiver({ signingSecret });
const app = new App({ token, receiver });

// Incident Response Trigger
const firstStep = flow.steps[flow.trigger.firstStep];
if (!firstStep) {
  throw new Error(
    `Definition for first step "${flow.trigger.firstStep}" not found`,
  );
}

app.command(flow.trigger.command, async ({ ack, body, client }) => {
  await ack();
  await convertOperation(firstStep)(client, body.trigger_id);
});

// handle modal submission
const openModalSteps = Object.entries(flow.steps)
  .filter(([_, s]) => s.action === "slack/openModal") as [
    string,
    SlackOpenModalAction,
  ][];
for (const [name, step] of openModalSteps) {
  const nextStep = flow.steps[step.nextStep];
  if (!nextStep) {
    throw new Error(`Next step of ${name} "${step.nextStep}" is not found`);
  }
  // const callbackId = `${CallBackIdPrefix}${step.nextStep}`;
  console.log("initial_report_submitted registered");

  // TODO callback_id is hardcoded
  app.view("initial_report_submitted", async ({ ack, body, client }) => {
    await ack();
    await convertOperation(nextStep)(client, "");
  });
}

function convertOperation(
  action: Action,
): (client: WebClient, triggerId: string) => Promise<void> {
  return async (client: WebClient, triggerId: string) => {
    switch (action.action) {
      case "slack/openModal": {
        const view = toModalView(action);
        await client.views.open({
          trigger_id: triggerId,
          view,
        });
        break;
      }
      case "slack/post": {
        await client.chat.postMessage({
          channel: action.channelId,
          text: action.message,
        });
      }
    }
  };
}

export const lambdaHandler = async (
  event: AwsEvent,
  context: unknown,
  callback: AwsCallback,
): Promise<AwsResponse> => {
  const handler = await receiver.start();
  return handler(event, context, callback);
};
