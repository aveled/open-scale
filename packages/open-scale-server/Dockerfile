FROM node:23.11.0-alpine

RUN apk add --no-cache python3 py3-pip make g++

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8485

ENV PORT=8485

CMD ["npm", "start"]


### Build Command
# > docker buildx build --platform linux/arm64/v8 -t open-scale-server .

### Run Command
# > docker run -d -p 8485:8485 open-scale-server
