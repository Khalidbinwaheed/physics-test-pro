# Multi-stage production build for Physics MCQ Examination Portal
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build production assets (Vite + Nitro SSR)
RUN npm run build

# Production runtime image
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built server and public assets
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Run the Nitro server
CMD ["node", ".output/server/index.mjs"]
