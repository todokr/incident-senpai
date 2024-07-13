#!/bin/bash -ex
FUNCTION_NAME=${1:?"Function name is required"}
ENTRY_POINT=${2:?"Entry point is required"}
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
  -t ${FUNCTION_NAME} \
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

docker tag ${FUNCTION_NAME}:latest $ECR_HOST/${FUNCTION_NAME}:latest
docker push $ECR_HOST/${FUNCTION_NAME}:latest

GIT_HASH=$(git rev-parse --short HEAD)
docker tag ${FUNCTION_NAME}:latest $ECR_HOST/${FUNCTION_NAME}:$GIT_HASH
docker push $ECR_HOST/${FUNCTION_NAME}:$GIT_HASH