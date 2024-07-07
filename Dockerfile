FROM gcr.io/distroless/cc as runner
ARG BUILD_ARTIFACT
ARG CONFIG_DIR
COPY --chown=nonroot:nonroot $BUILD_ARTIFACT bootstrap
COPY --chown=nonroot:nonroot $CONFIG_DIR $CONFIG_DIR
USER nonroot
CMD ["./bootstrap"]