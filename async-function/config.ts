// TODO layering

import fs from "node:fs";
import { parse } from "yaml";

export type Config = {
  ir: IncidentResponseConfig;
};

export type IncidentResponseConfig = {
  slackBaseChannelId: string;
  channelPrefix: string;
  triageLevels: Record<string, { label: string }>;
  incidentLevels: Record<string, { label: string }>;
  recipients: Record<string, { label: string; ids: string[] }>;
  services: Record<string, { label: string }>;
  notificationPolicies: ConditionalNotificationPolicy[];
  defaultNotificationPolicy: NotificationPolicy;
  roles: Roles;
};

export function loadConfig(fileName: string): Config {
  const path = `/opt/${fileName}`;
  const loaded = parse(
    fs.readFileSync(path, { encoding: "utf-8" }),
  );

  const ir = loaded.incident_response;
  const incidentResponse = {
    slackBaseChannelId: ir.slack.base_channel_id,
    channelPrefix: ir.slack.channel_prefix,
    triageLevels: ir["triage_levels"],
    incidentLevels: ir["incident_levels"],
    recipients: ir["recipients"],
    services: ir["services"],
    notificationPolicies: ir["notification_policies"],
    defaultNotificationPolicy: ir["default_notification_policies"],
    roles: ir["roles"],
  } as IncidentResponseConfig;

  // TODO: validation
  //       all recipients in notificationPolicies must be defined in recipients
  return { ir: incidentResponse };
}

export type NotificationPolicy = {
  label: string;
  recipientsLabel: string;
  recipients: string[];
};

export type ConditionalNotificationPolicy = NotificationPolicy & {
  conditions: { property: string; anyOf: string[] }[];
};

export function resolvePolicy(
  situation: { triageLevelCode: string; serviceCode: string },
  policies: ConditionalNotificationPolicy[],
  fallbackPolicy: NotificationPolicy,
): NotificationPolicy {
  const found = policies.find((policy) => {
    if (policy.conditions.length === 0) return false;
    return policy.conditions.every((condition) => {
      const target = condition.property === "triage_levels"
        ? situation.triageLevelCode
        : condition.property === "services"
        ? situation.serviceCode
        : undefined;

      if (!target) return true;
      return condition.anyOf.includes(target);
    });
  });
  return found
    ? {
      label: found.label,
      recipientsLabel: found.recipientsLabel,
      recipients: found.recipients,
    }
    : fallbackPolicy;
}

export type Roles = Record<
  string,
  { label: string; description: string; message: string }
>;
