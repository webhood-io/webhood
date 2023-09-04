FROM golang:1.20-bullseye as builder

# Create and change to the app directory.
WORKDIR /app

# Retrieve application dependencies.
# This allows the container build to reuse cached dependencies.
# Expecting to copy go.mod and if present go.sum.
COPY src/go.* ./
RUN go mod download

# Copy local code to the container image.
COPY src/*.go ./

# Build the binary.
RUN go build -v -o backend

FROM debian:12-slim as base

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /pb/

COPY --from=builder /app/backend ./backend

ADD ./migrations ./pb_migrations

ENTRYPOINT [ "./backend" ]
CMD [ "serve" ]