FROM denoland/deno:alpine-2.1.2

WORKDIR /app

COPY . .
RUN deno install
RUN deno task build

USER deno
EXPOSE 8485

# ENV ENVIRONMENT=production
# ENV DEBUG=false
# ENV LOG_LEVEL=info
ENV PORT=8485

CMD ["deno", "task", "start"]


### Build Command
# > docker buildx build --platform linux/arm64/v8 -t open-scale-server .

### Run Command
# > docker run -d -p 8485:8485 open-scale-server
