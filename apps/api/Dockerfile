FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

RUN pnpm install --filter api... --frozen-lockfile

COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN pnpm install --filter api... --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm run build

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "dist/src/server.js"]

