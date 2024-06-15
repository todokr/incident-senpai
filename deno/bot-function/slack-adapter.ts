import type { Modal } from "./modal-components.ts";
import { SlackAPI } from "https://deno.land/x/deno_slack_api@2.1.1/mod.ts";
import type { InputBlock, ModalView, SectionBlock } from "npm:@slack/types";
import type {
  Check,
  Description,
  Radio,
  Select,
  TextInput,
} from "./modal-components.ts";
import {
  isCheckbox,
  isDescription,
  isRadio,
  isSelect,
  isTextInput,
} from "./modal-components.ts";

const slackBotToken = Deno.env.get("SLACK_BOT_TOKEN");
if (!slackBotToken) {
  throw new Error("SLACK_BOT_TOKEN is not defined");
}
export const client = SlackAPI(slackBotToken);

export function toModalView(modal: Modal): ModalView {
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: modal.title,
    },
    blocks: modal.components.map((component) => {
      if (isSelect(component)) return selectBlock(component);
      if (isRadio(component)) return radio(component);
      if (isCheckbox(component)) return checkbox(component);
      if (isTextInput(component)) return textInput(component);
      if (isDescription(component)) return description(component);
      throw new Error(`Unknown component type: ${component}`);
    }),
    close: {
      type: "plain_text",
      text: modal.cancel.label,
    },
    submit: {
      type: "plain_text",
      text: modal.submit.label,
    },
    notify_on_close: true,
    callback_id: modal.callbackId,
  };
}

function selectBlock(component: Select): InputBlock {
  return {
    type: "input",
    block_id: component.blockId,
    element: {
      type: "static_select",
      action_id: component.actionId,
      placeholder: {
        type: "plain_text",
        text: component.label,
      },
      options: component.options.map((option) => ({
        text: {
          type: "plain_text",
          text: option.label,
        },
        value: option.code,
      })),
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
  };
}

function radio(component: Radio): InputBlock {
  return {
    type: "input",
    block_id: component.blockId,
    element: {
      type: "radio_buttons",
      action_id: component.actionId,
      options: component.options.map((option) => ({
        text: {
          type: "mrkdwn",
          text: option.label,
        },
        value: option.code,
      })),
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
  };
}

function checkbox(component: Check): InputBlock {
  return {
    type: "input",
    block_id: component.blockId,
    element: {
      type: "checkboxes",
      action_id: component.actionId,
      options: component.options.map((option) => ({
        text: {
          type: "mrkdwn",
          text: option.label,
        },
        value: option.code,
      })),
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
  };
}

function textInput(component: TextInput): InputBlock {
  return {
    type: "input",
    block_id: component.blockId,
    element: {
      type: "plain_text_input",
      action_id: component.actionId,
      placeholder: {
        type: "plain_text",
        text: component.placeHolder,
      },
      multiline: component.multiLine,
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
    optional: component.optional,
  };
}

function description(component: Description): SectionBlock {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: component.text,
    },
  };
}
