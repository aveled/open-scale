FROM denoland/deno:alpine-2.1.2 as builder

WORKDIR /app

ARG NEXT_PUBLIC_ENDPOINT
ENV NEXT_PUBLIC_ENDPOINT=$NEXT_PUBLIC_ENDPOINT

ARG NEXT_PUBLIC_KIOSK_MODE
ENV NEXT_PUBLIC_KIOSK_MODE=$NEXT_PUBLIC_KIOSK_MODE

COPY . .
RUN deno install
RUN deno task build


FROM node:22-alpine

WORKDIR /app

COPY package.json .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV PORT=8486

EXPOSE 8486

CMD ["node", "server.js"]


### Build Command
# > docker buildx build --platform linux/arm64/v8 --build-arg NEXT_PUBLIC_ENDPOINT=http://localhost:8485 --build-arg NEXT_PUBLIC_KIOSK_MODE=true -t open-scale-web .

### Run Command
# > docker run -d -p 8486:8486 open-scale-web
