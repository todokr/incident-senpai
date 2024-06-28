import type { ModalView } from "npm:@slack/bolt/types/views/modal";
import type { SlackOpenModalFunction } from "../config.ts";
import * as block from "./blocks.ts";

export function toModalView(fn: SlackOpenModalFunction): ModalView {
  const modalContent = fn.elements.map((element) => {
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
    }
  });

  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: fn.title,
    },
    blocks: modalContent,
    close: {
      type: "plain_text",
      text: fn.cancel?.label ?? "キャンセル",
    },
    submit: {
      type: "plain_text",
      text: fn.submit.label ?? "送信",
    },
    notify_on_close: true,
    callback_id: fn.name,
  };
}
