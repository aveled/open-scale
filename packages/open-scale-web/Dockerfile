FROM denoland/deno:alpine-2.1.2

WORKDIR /app

COPY . .
RUN deno install
RUN deno task build

USER deno
EXPOSE 8000

CMD ["deno", "task", "start"]


### Build Command
# > docker buildx build -t open-scale-web — platform linux/arm64/v8 — push .

### Run Command
# > docker run -d -p 8486:3000 -e NEXT_PUBLIC_ENDPOINT=http://localhost:8485 open-scale-web
