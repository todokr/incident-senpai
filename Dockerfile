# from denoland/deno:ubuntu as builder
# WORKDIR /build
# ENV TMPDIR=/tmp
# RUN mkdir -p /tmp
# COPY deno.json deno.lock ./
# COPY ./bot-function ./bot-function
# COPY ./shared ./shared
# COPY ./layers ./layers
# RUN ls -la
# RUN apt-get update && apt-get install -y unzip \
# && deno compile -A  bot-function/lambda-entrypoint.ts

FROM gcr.io/distroless/cc as runner
ARG BUILD_ARTIFACT
ARG CONFIG_DIR
COPY --chown=nonroot:nonroot $BUILD_ARTIFACT bootstrap
COPY --chown=nonroot:nonroot $CONFIG_DIR $CONFIG_DIR
USER nonroot
CMD ["./bootstrap"]