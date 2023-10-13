import { PlainTextOption, ViewsOpenArguments } from "@slack/web-api";
import { CallbackId } from "./consts";

export function initialReportModal(
  triggerId: string,
  callbackId: string,
  services: Record<string, { label: string }>,
  triageLevels: Record<string, { label: string }>,
): ViewsOpenArguments {
  const serviceBlocks: PlainTextOption[] = Object.entries(services).map(
    ([code, { label }]) => {
      return {
        text: {
          type: "plain_text",
          text: label,
        },
        value: code,
      };
    },
  );
  const triageLevelBlocks: PlainTextOption[] = Object.entries(triageLevels).map(
    ([code, { label }]) => {
      return {
        text: {
          type: "plain_text",
          text: label,
        },
        value: code,
      };
    },
  );
  return {
    trigger_id: triggerId,
    view: {
      callback_id: callbackId,
      type: "modal",
      title: {
        type: "plain_text",
        text: "インシデント疑義の報告",
      },
      submit: {
        type: "plain_text",
        text: "報告",
      },
      close: {
        type: "plain_text",
        text: "キャンセル",
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "落ち着いて状況を教えてください:coffee:",
          },
        },
        {
          type: "input",
          block_id: "service",
          label: {
            type: "plain_text",
            text: "事象が発生しているサービス",
          },
          element: {
            type: "static_select",
            action_id: "service",
            options: serviceBlocks,
          },
        },
        {
          type: "input",
          block_id: "triage",
          label: {
            type: "plain_text",
            text: "状況の温度感",
          },
          element: {
            type: "static_select",
            action_id: "triage",
            options: triageLevelBlocks,
          },
        },
        {
          type: "input",
          block_id: "description",
          element: {
            type: "plain_text_input",
            action_id: "description",
            placeholder: {
              type: "plain_text",
              text: "例）管理画面にアクセスすると503エラー",
            },
            multiline: true,
          },
          label: {
            type: "plain_text",
            text: "発生している事象",
          },
        },
      ],
    },
  };
}

export function updateIncidentLevelModal(
  triggerId: string,
  warroomChannelId: string,
  levels: Record<string, { label: string }>,
): ViewsOpenArguments {
  const levelBlocks: PlainTextOption[] = Object.entries(levels).map(
    ([code, { label }]) => {
      return {
        text: {
          type: "plain_text",
          text: label,
        },
        value: code,
      };
    },
  );
  return {
    trigger_id: triggerId,
    view: {
      callback_id: CallbackId.updateIncidentLevel,
      private_metadata: warroomChannelId,
      type: "modal",
      title: {
        type: "plain_text",
        text: "インシデントレベルの更新",
      },
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      close: {
        type: "plain_text",
        text: "Cancel",
      },

      blocks: [
        {
          type: "input",
          block_id: "incident_level",
          label: {
            type: "plain_text",
            text: "インシデントレベル",
          },
          element: {
            type: "static_select",
            action_id: "incident_level",
            options: levelBlocks,
          },
        },
      ],
    },
  };
}

export function declareContainmentModal(
  args: { triggerId: string; callbackId: string; warroomChannelId: string },
): ViewsOpenArguments {
  return {
    trigger_id: args.triggerId,
    view: {
      callback_id: args.callbackId,
      private_metadata: args.warroomChannelId,
      type: "modal",
      title: {
        type: "plain_text",
        text: "インシデントの収束宣言",
      },
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      close: {
        type: "plain_text",
        text: "Cancel",
      },

      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "インシデントの収束を宣言します。よろしいですか？",
          },
        },
        {
          "block_id": "containment_note",
          "type": "input",
          "optional": true,
          "element": {
            "type": "plain_text_input",
            "multiline": true,
            "action_id": "containment_note",
            "placeholder": {
              "type": "plain_text",
              "text":
                "収束に際しての補足情報があれば、こちらに記載してください",
            },
          },
          "label": {
            "type": "plain_text",
            "text": "補足情報",
            "emoji": true,
          },
        },
      ],
    },
  };
}
