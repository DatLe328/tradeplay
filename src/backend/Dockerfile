FROM golang:1.25-alpine AS base

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./

WORKDIR /app
RUN go mod download

FROM base AS builder
WORKDIR /app
COPY . .

RUN CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    go build -o /app/tradeplay .


FROM alpine:3.23 AS final

RUN addgroup -S tradeplay-group && adduser -S tradeplay-user -G tradeplay-group
RUN apk add --no-cache ca-certificates

WORKDIR /app/bin
COPY --from=builder /app/tradeplay ./tradeplay

RUN chown tradeplay-user:tradeplay-group tradeplay && chmod +x tradeplay

USER tradeplay-user

ENTRYPOINT ["./tradeplay"]
