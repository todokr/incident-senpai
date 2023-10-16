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

### 3. Setup bot
TODO

## Screenshot

### Reporting incident suspicion
![Reporting incident](https://github.com/todokr/incident-senpai/assets/2328540/ea5fea7d-6e9b-4d88-a21f-f388729ea00d)

### Starting incident respones at Warroom slack channel
![warroom](https://github.com/todokr/incident-senpai/assets/2328540/5a02bf37-50e6-47e3-a1b4-5019ecbdbfe9)

### Keep everyone on the same page
![basechannel](https://github.com/todokr/incident-senpai/assets/2328540/4c8bb649-c29f-4fe3-a61b-b114ef650a08)

### Export incident timeline for postmortem
![followup](https://github.com/todokr/incident-senpai/assets/2328540/0668f9a9-cbc1-4950-8935-084f4293a53b)


