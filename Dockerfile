FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts/start.mjs ./scripts/start.mjs
USER node
EXPOSE 8080
# Cloud Run supplies PORT; for a local container pass -e PORT=8080.
CMD ["node", "scripts/start.mjs"]
