import { WebClient } from "npm:@slack/web-api";

import { toModalView } from "../shared/blockkit/modal.ts";
import { FlowFunction } from "../shared/config.ts";
import { toPost } from "../shared/blockkit/post.ts";
import { SQS } from "npm:@aws-sdk/client-sqs";

export type FunctionInput = {
  triggerId: string;
  user?: {
    id: string;
    name: string;
  };
  values: {
    [key: string]: FunctionInputValue | FunctionInputValue[];
  };
};
export type FunctionInputValue = { label?: string; value?: string };

export class Executor {
  private slackClient: WebClient;
  private sqsClient: SQS;
  private queueUrl: string;

  constructor(private slackToken: string, queueUrl: string) {
    this.slackClient = new WebClient(slackToken);
    this.sqsClient = new SQS();
    this.queueUrl = queueUrl;
  }

  async run(fn: FlowFunction, input: FunctionInput) {
    switch (fn.action) {
      case "slack/openModal": {
        const modalOpen = {
          view: toModalView(fn),
          trigger_id: input.triggerId,
        };
        await this.slackClient.views.open(modalOpen);
        return;
      }
      case "slack/post": {
        const post = toPost(fn, input);
        await this.enqueue(post, fn.action);
        return;
      }
    }
  }

  private async enqueue(payload: unknown, action: FlowFunction["action"]) {
    await this.sqsClient.sendMessage({
      MessageBody: JSON.stringify({ action, payload }),
      QueueUrl: this.queueUrl,
    });
  }
}
