# ---- Stage 1: Build ----
FROM node:23.11.0-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# ---- Stage 2: Production ----
FROM node:23.11.0-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8486

COPY package.json package-lock.json ./

RUN npm install --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 8486

CMD ["npm", "run", "start"]
