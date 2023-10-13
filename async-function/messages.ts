import { IncidentResponseConfig, Roles } from "./config";
import { ActionId } from "./consts";

// TODO: configurable message text

export function initialMessage(reporterId: string, roles: Roles) {
  const roleBlocks = Object.entries(roles).map(
    ([code, { label, description }]) => {
      return {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": description,
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": `${label} 担当します`,
          },
          "action_id": ActionId.assignResponder,
          "value": code,
        },
      };
    },
  );
  return {
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text":
            "報告ありがとうございます。以下の手順に従って対応にあたりましょう。",
        },
      },
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": ":one: 状況を共有してください",
          "emoji": true,
        },
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text":
            `<@${reporterId}> 起きている事象や対応の温度感などを簡潔に教えてください。`,
        },
      },
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": ":two: 各ロールの担当者を決定してください",
          "emoji": true,
        },
      },
      ...roleBlocks,
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": ":three: 進展があり次第、状況を更新してください",
          "emoji": true,
        },
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "インシデントレベルを変更する",
        },
        "accessory": {
          "type": "button",
          "style": "danger",
          "text": {
            "type": "plain_text",
            "text": "変更する",
            "emoji": true,
          },
          "action_id": ActionId.openIncidentLevelModal,
        },
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "インシデントの収束を宣言する",
        },
        "accessory": {
          "type": "button",
          "style": "primary",
          "text": {
            "type": "plain_text",
            "text": "収束を宣言する",
            "emoji": true,
          },
          "action_id": ActionId.openContainmentModal,
        },
      },
      {
        "type": "divider",
      },
    ],
  };
}

export function baseChannelInitialMessage(
  warroom: { channelId: string; name: string },
  reportedBy: string,
  serviceName: string,
  triageLevelLabel: string,
  description: string,
) {
  return {
    text:
      `インシデント疑義が報告されました。 <#${warroom.channelId}> にて対応を開始します`,
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "<!here>",
        },
      },
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `インシデント疑義が報告されました ${warroom.name}`,
          "emoji": true,
        },
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `<#${warroom.channelId}> にて対応を開始します`,
        },
      },
      {
        "type": "section",
        "fields": [
          {
            "type": "mrkdwn",
            "text": `*報告者:*\n <@${reportedBy}>\n　`,
          },
          {
            "type": "mrkdwn",
            "text": `*サービス:*\n${serviceName}\n　`,
          },
          {
            "type": "mrkdwn",
            "text": `*温度感:*\n${triageLevelLabel}\n　`,
          },
          {
            "type": "mrkdwn",
            "text": `*状況:*\n${description}\n　`,
          },
        ],
      },
    ],
  };
}

export function assignMessage(
  assigneeId: string,
  roleLabel: string,
  roleMessage: string,
) {
  return {
    text: `<@${assigneeId}> が ${roleLabel} を担当します\n${roleMessage}`,
  };
}

export function baseChannelAssignMessage(
  warroomName: string,
  assigneeName: string,
  roleLabel: string,
) {
  return {
    text:
      `${warroomName} において、 ${assigneeName} が ${roleLabel} を担当します`,
  };
}

export function updateIncidentLevelMessage(
  updatedLevel: string,
  updaterId: string,
) {
  return {
    text:
      `インシデントレベル更新\n<@${updaterId}> がインシデントレベルを \`${updatedLevel}\` に更新しました。`,
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `:eyes: インシデントレベル更新`,
          "emoji": true,
        },
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text":
            `<@${updaterId}> がインシデントレベルを \`${updatedLevel}\` に更新しました。`,
        },
      },
    ],
  };
}

export function baseChannelUpdateIncidentLevelMessage(
  updatedLevel: string,
  updaterName: string,
  channelName: string,
) {
  return {
    text:
      `${channelName} インシデントレベル更新\n${updaterName} がインシデントレベルを \`${updatedLevel}\` に更新しました。`,
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `:eyes: ${channelName} インシデントレベル更新`,
          "emoji": true,
        },
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text":
            `${updaterName} がインシデントレベルを \`${updatedLevel}\` に更新しました。`,
        },
      },
    ],
  };
}

export function containmentDecralationMessage(
  containmenterId: string,
  note?: string,
) {
  const base = [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": ":star: インシデント収束",
        "emoji": true,
      },
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `<@${containmenterId}>が インシデントの収束を宣言しました。`,
      },
    },
  ];

  const blocks = note
    ? [...base, {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": `> ${note}`,
        },
      ],
    }]
    : base;

  return {
    text:
      `:star: インシデント収束\n${containmenterId}が インシデントの収束を宣言しました。`,
    blocks,
  };
}

export function baseChannelContainmentDecralationMessage(
  containmenterName: string,
  warroomName: string,
  note?: string,
) {
  const base = [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": ":star: インシデント収束",
        "emoji": true,
      },
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text":
          `${containmenterName}が *${warroomName}* の収束を宣言しました。`,
      },
    },
  ];

  const blocks = note
    ? [...base, {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": `> ${note}`,
        },
      ],
    }]
    : base;

  return {
    text:
      `:star: インシデント収束\n${containmenterName}が *${warroomName}* の収束を宣言しました。`,
    blocks,
  };
}

export function followupAction() {
  return {
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "インシデント フォローアップ",
          "emoji": true,
        },
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "対応お疲れさまでした:coffee:",
        },
      },
      {
        "type": "divider",
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text":
            "*インシデントタイムラインを出力*\n報告から終息宣言までのタイムラインを出力します",
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "出力",
          },
          "action_id": ActionId.showTimeline,
        },
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text":
              "ヒント: インシデント対応チャンネル内のメッセージに :pushpin: 絵文字をつけると、そのメッセージをインシデントタイムラインに含めることができます",
          },
        ],
      },
    ],
  };
}

export function timelineMessage(channelName: string, timeline: string) {
  return {
    text: `*${channelName}* のタイムライン\n${timeline}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: timeline,
        },
      },
    ],
  };
}

export function showFlow(
  config: IncidentResponseConfig,
  baseChannelName: string,
  roles: string,
  recipients: { label: string; names: string[] }[],
) {
  const toList = (obj: Record<string, { label: string }>): string => {
    return Object.entries(obj).map(([_, { label }]) => {
      return `- ${label}`;
    }).join("\n");
  };
  const rs = recipients.map(({ label, names }) =>
    `### ${label}\n${names.map((name) => `- ${name}`).join("\n")}\n`
  );

  return `## Slackチャンネル
- 報告チャンネル: \`${baseChannelName}\`
- 対応チャンネル \`${config.channelPrefix}_\${識別子}\`

## ロール
${roles}

## 報告時の温度感
${toList(config.triageLevels)}

## インシデントレベル
${toList(config.incidentLevels)}

## 報告受信者グループ
${rs}

## サービス
${toList(config.services)}
`;
}
