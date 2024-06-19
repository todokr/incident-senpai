# Incident Senpai

[English version](README-en.md)

スムースなインシデント対応フローを実現するSlackボット🤖

## 特徴

- Slackコマンドからインシデントを報告
- プライベートなインシデント対応チャンネルを作成
- 発生サービスやインシデントの重大度に応じて人を対応チャンネルに招待
- ロールの割当やインシデントレベルの更新を通知
- 状況をベースチャンネルにブロードキャスト
- インシデントタイムラインのエクスポート
- YAMLでの各種設定
- AWS SAMベースのデプロイ
- データストア不要

## スクリーンショット

| 機能                                       |                                                スクリーンショット                                                 |
| :----------------------------------------- | :---------------------------------------------------------------------------------------------------------------: |
| **インシデント疑義の報告**                 | ![reporting modal](https://github.com/todokr/incident-senpai/assets/2328540/8e222153-5a14-4e16-9f90-2369901f76c1) |
| **インシデント対応の開始**                 |     ![warroom](https://github.com/todokr/incident-senpai/assets/2328540/aebf3c61-a3a6-483e-8171-fc98e90da15f)     |
| **ベースチャンネルへのブロードキャスト**   |   ![basechannel](https://github.com/todokr/incident-senpai/assets/2328540/05c1c6c5-280e-4ea0-b1bc-563b43e69673)   |
| **インシデントタイムラインのエクスポート** |    ![followup](https://github.com/todokr/incident-senpai/assets/2328540/f2186082-8ce7-4d55-9449-3e02ce74b833)     |

## デプロイメント

### 1. 設定ファイルの作成

`*.template` ファイルを元に、設定ファイルを作成。値を埋める。

```bash
cp .env.template .env
cp layers/config.yaml.template layers/config.yaml
```

### 2. ビルドとデプロイ

[AWS SAM](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/what-is-sam.html)
をでデプロイする。

```bash
sam build -u && sam deploy --parameter-overrides SlackBotToken=$SLACK_BOT_TOKEN SlackSigningSecret=$SLACK_SIGNING_SECRET
```

### 3. Slackのセットアップ

TODO
