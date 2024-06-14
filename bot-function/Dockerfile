FROM denoland/deno-lambda:1.44.1

COPY app.ts .
RUN deno cache app.ts

CMD ["app.handler"]