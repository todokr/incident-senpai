import {
  ChatPostEphemeralArguments,
  ChatPostMessageArguments,
} from "npm:@slack/web-api";
import { FunctionInput } from "../../bot-function/executor.ts";
import { PostElement } from "../../shared/model/element.ts";
import { SlackPostFunction } from "../config/functions.ts";
import { mapRecord } from "../helper.ts";
import * as block from "./blocks.ts";
import { evalExpr } from "../expr-eval.ts";

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
    text: JSON.stringify(postContent),
  };
}

export function expandVariable<T>(
  element: T extends PostElement ? T : never,
  input: FunctionInput,
): T {
  let result: T = element;
  if ("text" in element) {
    result = { ...element, text: evalExpr(element.text, input) };
  }
  if ("label" in element) {
    result = { ...element, label: evalExpr(element.label, input) };
  }
  if ("items" in element) {
    const expandedItems = mapRecord(
      element.items,
      ([key, value]) => [key, evalExpr(value, input)],
    );
    result = { ...element, items: expandedItems };
  }
  return result;
}

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
