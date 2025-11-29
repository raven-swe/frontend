FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
RUN corepack enable

# Stage 1: Build the application
FROM base AS build
ENV NODE_ENV=development

ARG NUXT_PUBLIC_RECAPTCHA_SITE_KEY

ENV NUXT_PUBLIC_RECAPTCHA_SITE_KEY=$NUXT_PUBLIC_RECAPTCHA_SITE_KEY

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .
RUN pnpm mock:gen

# change back to production for build
ENV NODE_ENV=production

# Increase memory limit for Node.js during build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build Nuxt (SSR)
RUN pnpm build

# Stage 2: Runtime
FROM base

# Copy build output and necessary files
ENV NODE_ENV=production
COPY --from=build /app/.output /app/.output
COPY package.json ./

EXPOSE 3000
CMD ["pnpm", "start"]
