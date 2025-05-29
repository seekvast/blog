FROM node:22.15.1-alpine3.20 AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN pnpm run build
RUN pnpm prune --prod


FROM base AS production
ENV NODE_ENV=production
# 切换到非 root 用户 node
USER node
WORKDIR /home/node/app

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# COPY --from=builder --chown=node:node /app/dist ./dist
# 如果 Next.js 项目需要 .next/standalone 目录 (对于 output: "standalone")
# COPY --from=builder --chown=node:node /app/.next/standalone ./
# COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# COPY --from=builder --chown=node:node /app/public ./public

EXPOSE 3003

# 健康检查，确保应用在 /health 路径提供健康检查端点
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1

CMD ["pnpm", "start"]