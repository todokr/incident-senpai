FROM denoland/deno-lambda:1.44.4

RUN pwd
RUN ls -la

COPY ./bot-function ./bot-function
COPY ./shared ./shared
RUN deno cache bot-function/lambda.ts

CMD ["bot-function/lambda.handler"]