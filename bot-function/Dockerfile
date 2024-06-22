FROM denoland/deno-lambda:1.44.4

COPY main.ts .
RUN deno cache main.ts

CMD ["main.handler"]