import { WebClient } from "npm:@slack/web-api";

import { toModalView } from "../shared/blockkit/modal.ts";
import { Function, CreateIncidentFunction } from "../shared/config/functions.ts";
import { toPost } from "../shared/blockkit/post.ts";
import { SQS } from "npm:@aws-sdk/client-sqs";
import { AsyncTask } from "../shared/async-task.ts";
import { Incident, Service, IncidentLevel } from "../shared/model/incident.ts";


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

export type OpenIncidentFormInput = {
  triggerId: string;
  user?: {
    id: string;
    name: string;
  };
}

export type CreateIncidentInput = Incident;

export class Executor {
  private slackClient: WebClient;
  private sqsClient: SQS;
  private queueUrl: string;

  constructor(private slackToken: string, queueUrl: string) {
    this.slackClient = new WebClient(slackToken);
    this.sqsClient = new SQS();
    this.queueUrl = queueUrl;
  }

  /** This function exec the first half of the incident creation process.
    * It opens the modal for the user to fill in the incident details. */
  async openIncidentForm(fn: CreateIncidentFunction, input: OpenIncidentFormInput) {
    const modalOpen = {
      view: toModalView(fn),
      trigger_id: input.triggerId,
    };
    await this.slackClient.views.open(modalOpen);
  }

  async createIncident(input: Incident) {
    await this.enqueue({action: "inc/createIncident", payload: input})
  }

  private async enqueue(task: AsyncTask) {
    await this.sqsClient.sendMessage({
      MessageBody: JSON.stringify(task),
      QueueUrl: this.queueUrl,
      MessageGroupId: "default",
    });
  }
}
