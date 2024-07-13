import { assertEquals } from "jsr:@std/assert/assert-equals";
import { type AndCondition, Condition } from "./notification.ts";

Deno.test("Condition", () => {
  const cond = {
    op: "and",
    conditions: [
      {
        op: "or",
        conditions: [
          { op: "anyOf", property: "triage", values: ["emergency"] },
          { op: "anyOf", property: "severity", values: ["critical", "major"] },
        ],
      },
      { op: "anyOf", property: "service", values: ["delivery"] },
    ],
  };
  const actual = Condition.parse(cond);
  assertEquals(actual.op, "and");
  assertEquals((actual as AndCondition).conditions[0].op, "or");
});
