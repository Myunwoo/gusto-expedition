# syntax=docker/dockerfile:1

# ============================================
# Dependencies Stage: 의존성 설치
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# pnpm 활성화 및 의존성 파일 복사
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ============================================
# Build Stage: 애플리케이션 빌드
# ============================================
FROM node:20-alpine AS build
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN corepack enable && pnpm build

# ============================================
# Runner Stage: 프로덕션 실행 환경
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 보안을 위한 non-root user 생성
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# standalone 출력물 복사
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# 파일 소유권 변경
RUN chown -R nextjs:nodejs /app

# Non-root user로 전환
USER nextjs

# 포트 노출
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]

