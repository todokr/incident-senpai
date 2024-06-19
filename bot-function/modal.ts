import type {
  InputBlock,
  ModalView,
  Option,
  PlainTextOption,
  SectionBlock,
} from "@slack/bolt";

import type {
  OptionItems,
  SlackCheckboxComponent,
  SlackDescriptionComponent,
  SlackOpenModalAction,
  SlackRadioComponent,
  SlackSelectComponent,
  SlackTextInputComponent,
} from "./config";

import { CallBackIdPrefix } from "./bot-function";

export function toModalView(action: SlackOpenModalAction): ModalView {
  const modalContent = action.components.map((component) => {
    switch (component.type) {
      case "select":
        return selectBlock(component);
      case "radio":
        return radio(component);
      case "checkbox":
        return checkbox(component);
      case "textInput":
        return textInput(component);
      case "description":
        return description(component);
    }
  });
  console.log({ callback_id: `${CallBackIdPrefix}${action.nextStep}` });
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: action.title,
    },
    blocks: modalContent,
    close: action.cancel
      ? {
        type: "plain_text",
        text: action.cancel,
      }
      : undefined,
    submit: action.submit
      ? {
        type: "plain_text",
        text: action.submit,
      }
      : undefined,
    notify_on_close: true,
    callback_id: "initial_report_submitted",
  };
}

function selectBlock(component: SlackSelectComponent): InputBlock {
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
      options: plainTextOptions(component.options),
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
  };
}

function radio(component: SlackRadioComponent): InputBlock {
  return {
    type: "input",
    block_id: component.blockId,
    element: {
      type: "radio_buttons",
      action_id: component.actionId,
      options: mrkdwnOptions(component.options),
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
  };
}

function checkbox(component: SlackCheckboxComponent): InputBlock {
  return {
    type: "input",
    block_id: component.blockId,
    element: {
      type: "checkboxes",
      action_id: component.actionId,
      options: mrkdwnOptions(component.options),
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
  };
}

function textInput(component: SlackTextInputComponent): InputBlock {
  return {
    type: "input",
    block_id: component.blockId,
    label: {
      type: "plain_text",
      text: component.label,
    },
    element: {
      type: "plain_text_input",
      action_id: component.actionId,
      placeholder: component.placeholder
        ? {
          type: "plain_text",
          text: component.placeholder,
        }
        : undefined,
      multiline: component.multiline,
    },
    optional: component.optional,
  };
}

function description(component: SlackDescriptionComponent): SectionBlock {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: component.text,
    },
  };
}

function plainTextOptions(items: OptionItems): PlainTextOption[] {
  return Object.entries(items).map(([code, item]) => ({
    text: {
      type: "plain_text",
      text: item.label,
    },
    value: code,
  }));
}

function mrkdwnOptions(items: OptionItems): Option[] {
  return Object.entries(items).map(([code, item]) => ({
    text: {
      type: "mrkdwn",
      text: item.label,
    },
    value: code,
  }));
}
