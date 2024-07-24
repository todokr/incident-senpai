import { z } from "npm:zod";

const SlackIntegration = z.object({
  baseChannelId: z.string(),
  channelPrefix: z.string(),
});

const DynamoDBIntegration = z.object({
  type: z.literal("dynamodb"),
  region: z.string(),
  tableName: z.string(),
});

export const Integration = z.object({
  slack: SlackIntegration,
  datastore: DynamoDBIntegration,
});
