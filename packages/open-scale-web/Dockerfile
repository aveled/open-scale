# ---- Stage 1: Build ----
FROM denoland/deno:alpine-2.1.9 AS builder

WORKDIR /app

ARG NEXT_PROXY_ENDPOINT
ARG NEXT_SERVER_ENDPOINT
ARG NEXT_PUBLIC_KIOSK_MODE
ARG NODE_ENV=production

ENV NEXT_PROXY_ENDPOINT=$NEXT_PROXY_ENDPOINT
ENV NEXT_SERVER_ENDPOINT=$NEXT_SERVER_ENDPOINT
ENV NEXT_PUBLIC_KIOSK_MODE=$NEXT_PUBLIC_KIOSK_MODE
ENV NODE_ENV=$NODE_ENV

COPY package.json deno.lock* ./

RUN deno install

COPY . .

RUN deno task build


# ---- Stage 2: Runtime ----
FROM denoland/deno:alpine-2.1.9

WORKDIR /app

ARG NEXT_PROXY_ENDPOINT
ARG NEXT_SERVER_ENDPOINT
ARG NEXT_PUBLIC_KIOSK_MODE
ARG NODE_ENV=production
ARG PORT=8486

ENV NEXT_PROXY_ENDPOINT=$NEXT_PROXY_ENDPOINT
ENV NEXT_SERVER_ENDPOINT=$NEXT_SERVER_ENDPOINT
ENV NEXT_PUBLIC_KIOSK_MODE=$NEXT_PUBLIC_KIOSK_MODE

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE ${PORT}

CMD ["deno", "task", "start"]


### Build Command
# > docker buildx build --platform linux/arm64/v8 --build-arg NEXT_PUBLIC_ENDPOINT=http://localhost:8485 --build-arg NEXT_PUBLIC_KIOSK_MODE=true -t open-scale-web .

### Run Command
# > docker run -d -p 8486:8486 open-scale-web
