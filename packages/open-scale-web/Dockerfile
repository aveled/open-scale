FROM denoland/deno:alpine-2.1.2 AS builder

WORKDIR /app

ARG NEXT_PROXY_ENDPOINT
ENV NEXT_PROXY_ENDPOINT=$NEXT_PROXY_ENDPOINT

ARG NEXT_SERVER_ENDPOINT
ENV NEXT_SERVER_ENDPOINT=$NEXT_SERVER_ENDPOINT

ARG NEXT_PUBLIC_KIOSK_MODE
ENV NEXT_PUBLIC_KIOSK_MODE=$NEXT_PUBLIC_KIOSK_MODE

ENV NODE_ENV=production
ENV PORT=8486

COPY . .
RUN deno install
RUN deno task build

EXPOSE 8486

CMD ["deno", "task", "start"]


### Build Command
# > docker buildx build --platform linux/arm64/v8 --build-arg NEXT_PUBLIC_ENDPOINT=http://localhost:8485 --build-arg NEXT_PUBLIC_KIOSK_MODE=true -t open-scale-web .

### Run Command
# > docker run -d -p 8486:8486 open-scale-web
