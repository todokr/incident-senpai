import {
  ChatPostEphemeralArguments,
  ChatPostMessageArguments,
} from "npm:@slack/web-api";
import { SlackPostFunction } from "../config.ts";
import * as block from "./blocks.ts";

export function toPost(fn: SlackPostFunction): ChatPostMessageArguments {
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
      case "header":
        return block.headerBlock(element);
      case "text":
        return block.text(element);
      case "note":
        return block.noteBlock(element);
      case "button":
        return block.buttonBlock(element);
      case "dl":
        return block.definitionListBlock(element);
    }
  });
  return {
    channel: fn.channelId,
    blocks: postContent,
  };
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
