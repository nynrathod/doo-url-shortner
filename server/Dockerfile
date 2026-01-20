# Doo application Dockerfile
# Multi-stage build for minimal image size

# Build stage
FROM debian:bookworm-slim AS builder

RUN apt-get update && apt-get install -y \
    curl clang build-essential libssl-dev pkg-config unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Install doo compiler (latest)
RUN DOO_TAG=$(curl -fsSL https://api.github.com/repos/nynrathod/doolang/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/') && \
    DOO_VERSION=${DOO_TAG#v} && \
    mkdir -p ~/.doo/bin ~/.doo/bin/std && \
    curl -fsSL \
    https://github.com/nynrathod/doolang/releases/download/${DOO_TAG}/doo-linux-${DOO_VERSION}.zip \
    -o /tmp/doo.zip && \
    unzip -q /tmp/doo.zip -d /tmp/doo-extracted && \
    EXTRACT_DIR=$(find /tmp/doo-extracted -mindepth 1 -maxdepth 1 -type d | head -1) && \
    cp "$EXTRACT_DIR/doo" ~/.doo/bin/doo && \
    (cp "$EXTRACT_DIR"/*.so ~/.doo/bin/ 2>/dev/null || true) && \
    cp -r "$EXTRACT_DIR"/std/* ~/.doo/bin/std/ && \
    chmod +x ~/.doo/bin/doo && \
    rm -rf /tmp/doo.zip /tmp/doo-extracted

RUN ~/.doo/bin/doo build -o app

# Runtime stage
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN mkdir -p /app/lib
COPY --from=builder /app/app .
COPY --from=builder /root/.doo/bin/*.so /app/lib/
ENV LD_LIBRARY_PATH=/app/lib:/app
ENV DOO_ENV=production
EXPOSE 3000
CMD ["./app"]
