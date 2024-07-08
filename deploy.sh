#!/bin/bash -ex

ENTRY_POINT=./bot-function/lambda-entrypoint.ts
CONFIG_DIR=./layers
BUILD_DIR=./.build
BUILD_ARTIFACT=$BUILD_DIR/bootstrap

if [ BUILD_ARTIFACT ] 
then
  rm -f $BUILD_ARTIFACT
fi

mkdir -p $BUILD_DIR

deno compile -A -o $BUILD_ARTIFACT $ENTRY_POINT

docker build \
  -t incident-senpai-bot \
  --build-arg BUILD_ARTIFACT=$BUILD_ARTIFACT \
  --build-arg CONFIG_DIR=$CONFIG_DIR \
  -f Dockerfile .

  aws \
  --region ap-northeast-1 \
  ecr get-login-password | \
docker login \
  --username AWS \
  --password-stdin \
  $ECR_HOST

docker tag incident-senpai-bot:latest $ECR_HOST/incident-senpai-bot:latest
docker push $ECR_HOST/incident-senpai-bot:latest

GIT_HASH=$(git rev-parse --short HEAD)
docker tag incident-senpai-bot:latest $ECR_HOST/incident-senpai-bot:$GIT_HASH
docker push $ECR_HOST/incident-senpai-bot:$GIT_HASH