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

## デプロイメント

### 1. 設定ファイルの作成

`*.template` ファイルを元に、設定ファイルを作成。値を埋める。

```bash
cp .env.template .env
cp layers/config.yaml.template layers/config.yaml
```

### 2. ビルドとデプロイ

[AWS SAM](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/what-is-sam.html) をでデプロイする。

```bash
sam build -u && sam deploy --parameter-overrides Architecture=arm64 SlackBotToken=$SLACK_BOT_TOKEN SlackSigningSecret=$SLACK_SIGNING_SECRET
```

### 3. Slackのセットアップ
TODO

## スクリーンショット

| スクリーンショット
|:---|:---:|
| **インシデント疑義の報告** | ![インシデントの報告](https://github.com/todokr/incident-senpai/assets/2328540/ea5fea7d-6e9b-4d88-a21f-f388729ea00d) |
| **インシデント対応の開始** | ![warroom](https://github.com/todokr/incident-senpai/assets/2328540/5a02bf37-50e6-47e3-a1b4-5019ecbdbfe9) |
| **ベースチャンネルへのブロードキャスト** | ![basechannel](https://github.com/todokr/incident-senpai/assets/2328540/4c8bb649-c29f-4fe3-a61b-b114ef650a08) |
| **インシデントタイムラインのエクスポート** | ![followup](https://github.com/todokr/incident-senpai/assets/2328540/0668f9a9-cbc1-4950-8935-084f4293a53b) |


