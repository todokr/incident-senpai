import bolt from "npm:@slack/bolt";
import type {
  AwsCallback,
  AwsEvent,
  AwsResponse,
} from "npm:@slack/bolt/dist/receivers/AwsLambdaReceiver";
import { toModalView } from "./slack-adapter.ts";

const signingSecret = Deno.env.get("SLACK_SIGNING_SECRET");
if (!signingSecret) {
  throw new Error("SLACK_SIGNING_SECRET is not defined");
}
const token = Deno.env.get("SLACK_BOT_TOKEN");
if (!token) {
  throw new Error("SLACK_BOT_TOKEN is not defined");
}

const receiver = new bolt.AwsLambdaReceiver({ signingSecret });
const app = new bolt.App({ token, receiver });
app.command("/incident", async ({ ack, body, client }) => {
  await ack();
  await client.views.open({
    trigger_id: body.trigger_id,
    view: toModalView({
      triggerId: body.trigger_id,
      title: "Incident Report",
      components: [
        {
          type: "textInput",
          blockId: "description",
          actionId: "description",
          label: "Description",
          optional: false,
          placeholder: "Describe the incident",
          multiline: true,
        },
      ],
      submit: { label: "Submit" },
      cancel: { label: "Cancel" },
      callbackId: "incidentReport",
    }),
  });
});

export const handler = async (
  event: AwsEvent,
  context: unknown,
  callback: AwsCallback,
): Promise<AwsResponse> => {
  const handler = await receiver.start();
  return handler(event, context, callback);
};
