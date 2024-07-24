import { z } from "npm:zod";

const NotificationGroup = z.object({
  label: z.string(),
  ids: z.array(z.string()),
});
export const NotificationGroups = z.record(z.string(), NotificationGroup);

export type AndCondition = {
  op: "and";
  conditions: Condition[];
};
export type OrCondition = {
  op: "or";
  conditions: Condition[];
};

export type AnyOfCondition = {
  op: "anyOf";
  property: string;
  values: string[];
};
type Condition = AndCondition | OrCondition | AnyOfCondition;

export const Condition: z.ZodType<Condition> = z.object({
  op: z.literal("and"),
  conditions: z.lazy(() => z.array(Condition)),
}).or(
  z.object({
    op: z.literal("or"),
    conditions: z.lazy(() => z.array(Condition)),
  }),
).or(
  z.object({
    op: z.literal("anyOf"),
    property: z.string(),
    values: z.array(z.string()),
  }),
);

const NotificationPolicy = z.object({
  label: z.string(),
  recipients: z.array(NotificationGroup),
  condition: Condition,
});

export const NotificationPolicies = z.array(NotificationPolicy);
export const FallbackNotificationPolicy = z.array(NotificationGroup);
