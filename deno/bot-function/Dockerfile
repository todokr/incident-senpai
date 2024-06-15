FROM denoland/deno-lambda:1.44.2

COPY *.ts ./
RUN deno cache *.ts

CMD ["app.handler"]