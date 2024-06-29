import {
  ChatPostEphemeralArguments,
  ChatPostMessageArguments,
} from "npm:@slack/web-api";
import { HeaderElement, PostElement, SlackPostFunction } from "../config.ts";
import * as block from "./blocks.ts";
import { FunctionInput } from "../../bot-function/main.ts";
import { assertEquals } from "jsr:@std/assert";
import { mapRecord } from "../helper.ts";

export function toPost(
  fn: SlackPostFunction,
  input: FunctionInput,
): ChatPostMessageArguments {
  const postContent = fn.elements.map((element) => {
    switch (element.type) {
      case "select":
        return block.selectBlock(element);
      case "channelSelect":
        return block.channelSelectBlock(element);
      case "userSelect":
        return block.userSelectBlock(element);
      case "dateTimePicker":
        return block.dateTimePickerBlock(element);
      case "radio":
        return block.radio(element);
      case "checkbox":
        return block.checkbox(element);
      case "textInput":
        return block.textInput(element);
      case "header": {
        const expanded = expandVariable(element, input);
        return block.headerBlock(expanded);
      }
      case "text": {
        const expanded = expandVariable(element, input);
        return block.text(expanded);
      }
      case "note": {
        const expanded = expandVariable(element, input);
        return block.noteBlock(expanded);
      }
      case "button":
        return block.buttonBlock(element);
      case "dl": {
        const expanded = expandVariable(element, input);
        return block.definitionListBlock(expanded);
      }
    }
  });
  return {
    channel: fn.channelId,
    blocks: postContent,
  };
}

function expandVariable<T>(
  element: T extends PostElement ? T : never,
  // deno-lint-ignore no-explicit-any
  input: any,
): T {
  let result: T = element;
  if ("text" in element) {
    result = { ...element, text: expand(element.text, input) };
  }
  if ("label" in element) {
    result = { ...element, label: expand(element.label, input) };
  }
  if ("items" in element) {
    const expandedItems = mapRecord(
      element.items,
      ([key, value]) => [key, expand(value, input)],
    );
    result = { ...element, items: expandedItems };
  }
  return result;
}
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

/**
 * Expand variables in the form of `${{input.person.name}}` in the given string.
 */
const InputVarPattern = /\${{input\.([^}]+)}}/g;

// deno-lint-ignore no-explicit-any
function expand(variableable: string, input: any): string {
  console.log(variableable, input);
  return variableable.replace(InputVarPattern, (_, varExpr) => {
    const path = varExpr.split(".");
    // deno-lint-ignore no-explicit-any
    let result: any = input;
    try {
      // deno-lint-ignore no-explicit-any
      result = path.reduce((acc: any, key: string) => acc[key], input);
    } catch (_e) {
      result = `🚨 could not expand config variable from config.

      -----------------------------------------
      variable
      -----------------------------------------
      ${varExpr}

      -----------------------------------------
      input
      -----------------------------------------
      ${JSON.stringify(input, null, 2)}`;
    }
    return result;
  });
}

Deno.test("expand", () => {
  const input = { values: { name: "John", age: 24 } };
  assertEquals(
    expand("Hello, ${{input.vlaues.name}}(${{input.values.age}})", input),
    "Hello, John(24)",
  );
});

export function toEphemeral(
  fn: SlackPostFunction,
  userId: string,
): ChatPostEphemeralArguments {
  return {
    channel: fn.channelId,
    text: "Hello, world!",
    user: userId,
  };
}
