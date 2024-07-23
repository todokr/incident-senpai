import { SQSEvent } from "https://deno.land/x/lambda@1.44.4/mod.ts";
import { isAsyncTask } from "../shared/async-task.ts";
import { start } from "../shared/lambda-entrypoint.ts";
import { WebClient } from "npm:@slack/web-api";

const SlackToken = Deno.env.get("SLACK_BOT_TOKEN");
if (!SlackToken) {
  throw new Error("SLACK_BOT_TOKEN is not defined");
}

const slackClient = new WebClient(SlackToken);

await start(consume);

async function consume(event: SQSEvent): Promise<{ body: string }> {
  console.log(JSON.stringify(event));
  const body = JSON.parse(event.Records[0].body);
  console.debug("body", JSON.stringify(body));
  if (isAsyncTask(body)) {
    console.debug("isAsyncTask", JSON.stringify(body));
    switch (body.action) {
      case "slack/post": {
        console.debug("slack/post", JSON.stringify(body.payload));
        const res = await slackClient.chat.postMessage(body.payload);
        return { body: res.ok ? "ok" : res.error ?? "unknown error" };
      }
      case "slack/postEphemeral": {
        console.debug("slack/postEphemeral", JSON.stringify(body.payload));
        return { body: "ok" };
      }
      case "datastore/createIncident": {
        console.debug("datastore/createIncident", JSON.stringify(body.payload));
        // TODO: Implement incident creation logic
        return { body: "ok" };
      }
    }
  } else {
    console.error("Unknown task", JSON.stringify(body));
    return { body: "ng" };
  }
}
