# Incident Senpai

Incident Senpai is a Slack bot that helps organize incident response flow.  

## Features
- Report incident from Slack command
- Create private warroom channel 
- Invite people according to service and incident severity
- Notify role assignment
- Declare incident level
- Broadcast incident status to base channel
- Export incident timeline
- YAML based configuration
- AWS SAM based deployment
- No datastore required

Multilingual support for messages posted to Slack is not supported. But feel free to create an issue if you need it!

| Feature | Screenshot |
|:---|:---:|
| **Reporting** | ![reporting modal](https://github.com/todokr/incident-senpai/assets/2328540/8e222153-5a14-4e16-9f90-2369901f76c1) |
| **Start response** | ![warroom](https://github.com/todokr/incident-senpai/assets/2328540/aebf3c61-a3a6-483e-8171-fc98e90da15f) |
| **Broadcast to base channel** | ![basechannel](https://github.com/todokr/incident-senpai/assets/2328540/05c1c6c5-280e-4ea0-b1bc-563b43e69673) |
| **Export timeline** | ![followup](https://github.com/todokr/incident-senpai/assets/2328540/f2186082-8ce7-4d55-9449-3e02ce74b833) |

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

### 3. Setup bot
TODO

