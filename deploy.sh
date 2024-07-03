#!/bin/bash -ex

aws \
  --region ap-northeast-1 \
  ecr get-login-password | \
docker login \
  --username AWS \
  --password-stdin \
  $ECR_HOST

docker build \
  -t incident-senpai-bot \
  -f Dockerfile .

docker tag incident-senpai-bot:latest $ECR_HOST/incident-senpai-bot:latest
docker push $ECR_HOST/incident-senpai-bot:latest

GIT_HASH=$(git rev-parse --short HEAD)
docker tag incident-senpai-bot:latest $ECR_HOST/incident-senpai-bot:$GIT_HASH
docker push $ECR_HOST/incident-senpai-bot:$GIT_HASH