FROM node:22.12.0-alpine

RUN apk add --no-cache python3 py3-pip make g++

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8485

# ENV ENVIRONMENT=production
# ENV DEBUG=false
# ENV LOG_LEVEL=info
ENV PORT=8485

CMD ["npm", "start"]


### Build Command
# > docker buildx build --platform linux/arm64/v8 -t open-scale-server .

### Run Command
# > docker run -d -p 8485:8485 open-scale-server
