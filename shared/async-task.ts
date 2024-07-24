import {
  ChatPostEphemeralArguments,
  ChatPostMessageArguments,
} from "npm:@slack/web-api";
import { Incident } from "./model/incident.ts";

export type AsyncTask =
  | SlackPostTask
  | SlackEphemeralPostTask
  | CreateIncidentTask
// deno-lint-ignore no-explicit-any
export function isAsyncTask(task: any): task is AsyncTask {
  return "action" in task && "payload" in task;
}

type SlackPostTask = {
  action: "slack/post";
  payload: ChatPostMessageArguments;
};

type SlackEphemeralPostTask = {
  action: "slack/postEphemeral";
  payload: ChatPostEphemeralArguments;
};

type CreateIncidentTask = {
  action: "inc/createIncident";
  payload: Incident;
};
