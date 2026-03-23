FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 make g++ cmake libopus-dev \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9.6.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 make g++ cmake libopus-dev \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9.6.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY config.json lang.json ./

CMD ["node", "dist/index.js"]