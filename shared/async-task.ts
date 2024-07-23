import {
  ChatPostEphemeralArguments,
  ChatPostMessageArguments,
} from "npm:@slack/web-api";

export type AsyncTask =
  | SlackPostTask
  | SlackEphemeralPostTask
  | DatastoreCreateIncidentTask;
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

type DatastoreCreateIncidentTask = {
  action: "datastore/createIncident";
  payload: {
    summary: string;
    reporter: {
      id: string;
      name: string;
    };
    metadata: Record<string, unknown>;
  };
};
