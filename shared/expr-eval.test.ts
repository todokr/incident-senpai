import { assertEquals } from "jsr:@std/assert/assert-equals";
import { evalExpr } from "./expr-eval.ts";

Deno.test("evalExpr", () => {
  const input = { person: { name: "John", age: 24 } };
  const text = "Hello, ${{input.person.name}}(${{input.person.age}})";
  assertEquals(evalExpr(text, input), "Hello, John(24)");
});
