FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install --filter web...

COPY apps/web ./apps/web

WORKDIR /app/apps/web
RUN pnpm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["pnpm", "run", "start"]
