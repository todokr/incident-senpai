import { describe, expect, it } from "@jest/globals";

import { loadConfig } from "../../config";

describe("config loader", () => {
  it("loads config", () => {
    const config = loadConfig("./tests/test.config.yaml");

    expect(config.incidentResponse.slackBaseChannelId).toBe("C05DUVBEADU");
    expect(
      config.incidentResponse.triageLevels.emergency.label,
    ).toBe(":fire: サービスに影響が出ており、緊急の対応が必要");
    expect(
      config.incidentResponse.incidentLevels.disaster.label,
    ).toBe("Disaster");

    const policyForA = config.incidentResponse.notificationPolicies[0];
    expect(policyForA.label).toBe("[緊急] 認証, 決済");
    expect(policyForA.recipients).toEqual([
      "executives",
      "managers_a",
      "developers_a",
    ]);

    expect(policyForA.conditions[1]).toEqual({
      property: "services",
      anyOf: ["auth-service", "payment-service"],
    });

    expect(
      config.incidentResponse.services["auth-service"].label,
    ).toBe("認証サービス（A部署担当）");
  });
});
