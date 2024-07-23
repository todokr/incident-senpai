import { WebClient } from "npm:@slack/web-api";

import { toModalView } from "../shared/blockkit/modal.ts";
import { Function } from "../shared/config/functions.ts";
import { toPost } from "../shared/blockkit/post.ts";
import { SQS } from "npm:@aws-sdk/client-sqs";
import { AsyncTask } from "../shared/async-task.ts";
import { evalExpr } from "../shared/expr-eval.ts";

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

  async run(fn: Function, input: FunctionInput) {
    switch (fn.action) {
      case "slack/openModal": {
        const modalOpen = {
          view: toModalView(fn),
          trigger_id: input.triggerId,
        };
        await this.slackClient.views.open(modalOpen);
        break;
      }
      case "slack/post": {
        const post = toPost(fn, input);
        await this.enqueue({ action: fn.action, payload: post });
        break;
      }
      case "datastore/createIncident": {
        const payload = {
          summary: evalExpr(fn.summary, input),
          reporter: {
            id: evalExpr(fn.reporter.id, input),
            name: evalExpr(fn.reporter.name, input),
          },
          metadata: fn.metadata,
        };
        await this.enqueue({ action: fn.action, payload });
        break;
      }
      default:
        throw new Error(
          `Unknown type: ${(fn as { action: "__invalid__" }).action}`,
        );
    }
  }

  private async enqueue(task: AsyncTask) {
    await this.sqsClient.sendMessage({
      MessageBody: JSON.stringify(task),
      QueueUrl: this.queueUrl,
      MessageGroupId: "default",
    });
  }
}
