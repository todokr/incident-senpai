import { assertEquals } from "jsr:@std/assert/assert-equals";
import { HeaderElement } from "../model/element.ts";
import { expandVariable } from "./post.ts";

Deno.test("expandVariable", () => {
  const input = { person: { name: "John", age: 24 } };
  const header: HeaderElement = {
    type: "header",
    text: "Hello, ${{person.name}}(${{person.age}})",
  };
  assertEquals(expandVariable(header, input), {
    type: "header",
    text: "Hello, John(24)",
  });
});
