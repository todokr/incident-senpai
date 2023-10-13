import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import {
  AllMiddlewareArgs,
  BlockButtonAction,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackViewMiddlewareArgs,
} from "@slack/bolt";
import { Config } from "./config";
import { CallbackId } from "./consts";
import {
  declareContainmentModal,
  initialReportModal,
  updateIncidentLevelModal,
} from "./views";

const QueueUrl = process.env.ASYNC_TASK_QUEUE_URL;
if (!QueueUrl) {
  throw new Error("ASYNC_TASK_QUEUE_URL is not defined");
}
const sqsClient = new SQSClient();

export const Handler = (config: Config) => (
  {
    openReportModal: openReportModal(config),
    openIncidentLevelModal: openIncidentLevelModal(config),
    openContainmentModal: openContainmentModal(config),
    processAsync: processAsync(config),
  }
);

/** Open modal to submit initial report */
const openReportModal = (config: Config) =>
async (
  args: SlackCommandMiddlewareArgs & AllMiddlewareArgs,
): Promise<void> => {
  const { ack, body, client } = args;
  await ack();

  await client.views.open(
    initialReportModal(
      body.trigger_id,
      CallbackId.initialReportSubmitted,
      config.incidentResponse.services,
      config.incidentResponse.triageLevels,
    ),
  );
};

/** Open modal to update incident level */
const openIncidentLevelModal = (config: Config) =>
async (
  args: SlackActionMiddlewareArgs<BlockButtonAction> & AllMiddlewareArgs,
): Promise<void> => {
  const { ack, body, client } = args;
  await ack();

  await client.views.open(
    updateIncidentLevelModal(
      body.trigger_id,
      body.channel!.id,
      config.incidentResponse.incidentLevels,
    ),
  );
};

/** Open containment modal */
const openContainmentModal = (config: Config) =>
async (
  args: SlackActionMiddlewareArgs<BlockButtonAction> & AllMiddlewareArgs,
): Promise<void> => {
  const { ack, body, client } = args;
  await ack();

  await client.views.open(
    declareContainmentModal({
      triggerId: body.trigger_id,
      callbackId: CallbackId.declareContainment,
      warroomChannelId: body.channel!.id,
    }),
  );
};

/**
 *  Process requests via SQS(async-task-queue) -> Lambda(async-function)
 */
const processAsync = (config: Config) =>
async (
  args:
    | SlackCommandMiddlewareArgs
    | SlackActionMiddlewareArgs
    | SlackViewMiddlewareArgs
    | SlackEventMiddlewareArgs,
): Promise<void> => {
  const { ack, body } = args;
  ack && await ack();

  const message = new SendMessageCommand({
    MessageBody: JSON.stringify(body),
    QueueUrl,
  });
  await sqsClient.send(message);
};
