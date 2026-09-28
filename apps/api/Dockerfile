FROM node:22-alpine AS base
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace package manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

# Install dependencies
RUN pnpm install --filter api...

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma Client & Build TypeScript
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm run build

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
