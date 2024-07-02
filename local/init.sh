#!/bin/bash -ex
awslocal sqs  create-queue --queue-name incident-management-bot-async-task-queue
