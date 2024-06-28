import type { KnownBlock, Option, PlainTextOption } from "npm:@slack/types";
import type {
  ButtonElement,
  ChannelSelectElement,
  CheckboxElement,
  DateTimePickerElement,
  DefinitionListElement,
  HeaderElement,
  NoteElement,
  OptionItems,
  PlainSelectElement,
  RadioElement,
  TextElement,
  TextInputElement,
  UserSelectElement,
} from "../config.ts";

export function selectBlock(element: PlainSelectElement): KnownBlock {
  return {
    type: "input",
    block_id: element.elementId,
    label: {
      type: "plain_text",
      text: element.label,
    },
    element: {
      type: "static_select",
      action_id: element.elementId,
      placeholder: {
        type: "plain_text",
        text: element.label,
      },
      options: plainTextOptions(element.options),
    },
  };
}

export function channelSelectBlock(element: ChannelSelectElement): KnownBlock {
  return {
    type: "input",
    block_id: element.elementId,
    label: {
      type: "plain_text",
      text: element.label,
    },
    element: {
      type: "channels_select",
      action_id: element.elementId,
      placeholder: {
        type: "plain_text",
        text: element.label,
      },
    },
  };
}

export function dateTimePickerBlock(
  element: DateTimePickerElement,
): KnownBlock {
  return {
    type: "input",
    block_id: element.elementId,
    element: {
      type: "datepicker",
      action_id: element.elementId,
      placeholder: {
        type: "plain_text",
        text: element.label,
      },
    },
    label: {
      type: "plain_text",
      text: element.label,
    },
  };
}

export function userSelectBlock(element: UserSelectElement): KnownBlock {
  return {
    type: "input",
    block_id: element.elementId,
    element: {
      type: "users_select",
      action_id: element.elementId,
      placeholder: {
        type: "plain_text",
        text: element.label,
      },
    },
    label: {
      type: "plain_text",
      text: element.label,
    },
  };
}

export function radio(component: RadioElement): KnownBlock {
  return {
    type: "input",
    block_id: component.elementId,
    element: {
      type: "radio_buttons",
      action_id: component.elementId,
      options: mrkdwnOptions(component.options),
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
  };
}

export function checkbox(component: CheckboxElement): KnownBlock {
  return {
    type: "input",
    block_id: component.elementId,
    element: {
      type: "checkboxes",
      action_id: component.elementId,
      options: mrkdwnOptions(component.options),
    },
    label: {
      type: "plain_text",
      text: component.label,
    },
  };
}

export function textInput(component: TextInputElement): KnownBlock {
  return {
    type: "input",
    block_id: component.elementId,
    label: {
      type: "plain_text",
      text: component.label,
    },
    element: {
      type: "plain_text_input",
      action_id: component.elementId,
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

export function headerBlock(component: HeaderElement): KnownBlock {
  return {
    type: "header",
    text: {
      type: "plain_text",
      text: component.text,
      emoji: true,
    },
  };
}

export function text(component: TextElement): KnownBlock {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: component.text,
    },
  };
}

export function noteBlock(element: NoteElement): KnownBlock {
  return {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: element.text,
      },
    ],
  };
}

export function buttonBlock(element: ButtonElement): KnownBlock {
  return {
    type: "section",
    text: {
      type: "plain_text",
      text: element.label,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: element.label,
      },
      action_id: element.elementId,
    },
  };
}

export function definitionListBlock(
  element: DefinitionListElement,
): KnownBlock {
  return {
    type: "section",
    fields: Object.entries(element.items).map(([term, definition]) => ({
      type: "mrkdwn",
      text: `*${term}*\n${definition}`,
    })),
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
