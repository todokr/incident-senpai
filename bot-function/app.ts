import { App, AwsLambdaReceiver } from "@slack/bolt";
import type {
  AwsCallback,
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";
import { loadConfig } from "./config";
import { ActionId, CallbackId, Command } from "./consts";
import { Handler } from "./handlers";

const signingSecret = process.env.SLACK_SIGNING_SECRET;
if (!signingSecret) {
  throw new Error("SLACK_SIGNING_SECRET is not defined");
}

const token = process.env.SLACK_BOT_TOKEN;
if (!token) {
  throw new Error("SLACK_BOT_TOKEN is not defined");
}

const receiver = new AwsLambdaReceiver({ signingSecret });
const app = new App({ token, receiver });

const config = loadConfig("config.yaml");
const handler = Handler(config);

app.command(Command.incident, handler.openReportModal);
app.command(Command.showFlow, handler.processAsync);

app.view({
  callback_id: CallbackId.initialReportSubmitted,
  type: "view_submission",
}, handler.processAsync);
app.view({
  callback_id: CallbackId.updateIncidentLevel,
  type: "view_submission",
}, handler.processAsync);
app.view({
  callback_id: CallbackId.declareContainment,
  type: "view_submission",
}, handler.processAsync);

app.action(ActionId.assignResponder, handler.processAsync);
app.action(ActionId.openIncidentLevelModal, handler.openIncidentLevelModal);
app.action(ActionId.openContainmentModal, handler.openContainmentModal);
app.action(ActionId.showTimeline, handler.processAsync);

app.event("reaction_added", handler.processAsync);

export const lambdaHandler = async (
  event: AwsEvent,
  context: unknown,
  callback: AwsCallback,
): Promise<AwsResponse> => {
  const handler = await receiver.start();
  return handler(event, context, callback);
};
