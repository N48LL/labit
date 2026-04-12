FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/.output .output
RUN mkdir -p data/boards data/icons
EXPOSE 3000
ENV HOST=0.0.0.0
CMD ["node", ".output/server/index.mjs"]
