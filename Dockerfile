# ─────────────────────────────────────────────────────────────────────────────
# Docker image for the public demo on Render (see render.yaml).
#
# Two stages:
#   1. "build":  installs PHP packages (Composer) and builds the React/CSS
#                assets with Node (Vite). Node is only needed here.
#   2. runtime:  a small PHP + Nginx image that serves the finished app.
#
# Base images: https://serversideup.net/open-source/docker-php/
# ─────────────────────────────────────────────────────────────────────────────

# ---------- Stage 1: build ----------
FROM serversideup/php:8.3-cli AS build

USER root

# Node.js 24 (copied from the official Node image) for the Vite build
COPY --from=node:24-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /var/www/html

# Install dependencies first (cached by Docker until the lock files change)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY package.json package-lock.json ./
RUN npm ci

# Copy the app and build it
COPY . .

# The site name is baked into the JavaScript at build time (browser tab titles)
ENV VITE_APP_NAME="RHLBD.COM"

RUN composer dump-autoload --optimize --no-dev \
    && npm run build \
    && rm -rf node_modules

# ---------- Stage 2: runtime ----------
FROM serversideup/php:8.3-fpm-nginx

# Faster PHP in production
ENV PHP_OPCACHE_ENABLE=1

# Our own start-up script (prepares the demo database, see the file)
COPY --chmod=755 docker/entrypoint.d/ /etc/entrypoint.d/

# The finished app, owned by the web server user so it can write
# storage/, bootstrap/cache/ and the SQLite database
COPY --chown=www-data:www-data --from=build /var/www/html /var/www/html

# Nginx in this image listens on port 8080 (Render is told so via PORT=8080)
EXPOSE 8080
