import {
  ChatPostEphemeralArguments,
  ChatPostMessageArguments,
} from "npm:@slack/web-api";

export type AsyncTask = PostTask | EphemeralPostTask;
// deno-lint-ignore no-explicit-any
export function isAsyncTask(task: any): task is AsyncTask {
  return "action" in task && "payload" in task;
}

type PostTask = {
  action: "slack/post";
  payload: ChatPostMessageArguments;
};

type EphemeralPostTask = {
  action: "slack/postEphemeral";
  payload: ChatPostEphemeralArguments;
};
