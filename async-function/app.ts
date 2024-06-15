import { BlockButtonAction } from "@slack/bolt/dist/types/actions";
import { ReactionAddedEvent } from "@slack/bolt/dist/types/events";
import { ViewSubmitAction } from "@slack/bolt/dist/types/view";
import { WebClient } from "@slack/web-api";
import { SQSEvent } from "aws-lambda";
import { loadConfig } from "./config";
import { ActionId, CallbackId, Command } from "./consts";
import { BookmarkEventStore } from "./eventstore";
import { JobExecutor } from "./executor";

const token = process.env.SLACK_BOT_TOKEN;
if (!token) {
  throw new Error("SLACK_BOT_TOKEN is not defined");
}
const logger = console;
const client = new WebClient(token);
const config = loadConfig("config.yaml");
const eventStore = BookmarkEventStore(client);
const executor = new JobExecutor(config.ir, client, eventStore);

export const lambdaHandler = async (event: SQSEvent, context: unknown) => {
  const body = JSON.parse(event.Records[0].body);
  logger.debug(JSON.stringify(body));

  if (isReportSubmission(body)) {
    await executor.startIncidentResponse(body);
  } else if (isAssignResponder(body)) {
    await executor.notifyAssignment(body);
  } else if (isUpdateIncidentLevel(body)) {
    await executor.updateIncidentLevel(body);
  } else if (isDeclareContainment(body)) {
    await executor.declareContainment(body);
  } else if (isShowTimeline(body)) {
    await executor.showTimeline(body);
  } else if (isPostPinned(body)) {
    await executor.pinMessage(body);
  } else if (isShowFlow(body)) {
    await executor.showFlow(body);
  }
};

function isReportSubmission(body: any): body is ViewSubmitAction {
  return body.type === "view_submission" &&
    body.view.callback_id === CallbackId.initialReportSubmitted;
}

function isAssignResponder(body: any): body is BlockButtonAction {
  return body.type === "block_actions" &&
    body.actions[0].action_id === ActionId.assignResponder;
}

function isUpdateIncidentLevel(body: any): body is ViewSubmitAction {
  return body.type === "view_submission" &&
    body.view.callback_id === CallbackId.updateIncidentLevel;
}

function isDeclareContainment(body: any): body is ViewSubmitAction {
  return body.type === "view_submission" &&
    body.view.callback_id === CallbackId.declareContainment;
}

function isShowTimeline(body: any): body is BlockButtonAction {
  return body.type === "block_actions" &&
    body.actions[0].action_id === ActionId.showTimeline;
}

function isPostPinned(body: any): body is ReactionAddedEvent {
  return body.type === "reaction_added" &&
    body.event.reaction === "pushpin";
}

function isShowFlow(body: any): body is ShowFlow {
  return body.command === Command.showFlow;
}

export type ShowFlow = {
  channel_id: string;
  user_id: string;
};
