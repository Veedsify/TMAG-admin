FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:latest AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["bun", "x", "serve", "-l", "0.0.0.0", "-p", "3001", "dist"]
