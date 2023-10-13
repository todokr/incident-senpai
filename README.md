# Incident Senpai

## Deployment

### 1. Create config file

Copy original files and fill in the values.

```bash
cp .env.template .env
cp layers/config.yaml.template layers/config.yaml
```

### 2. Build and deploy

```bash
sam build -u && sam deploy --parameter-overrides Architecture=arm64 SlackBotToken=$SLACK_BOT_TOKEN SlackSigningSecret=$SLACK_SIGNING_SECRET
```