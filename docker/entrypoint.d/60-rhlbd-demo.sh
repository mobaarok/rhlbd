#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Runs every time the demo container starts on Render (before the web server).
#
# The demo uses a small SQLite database inside the container. It is rebuilt
# from scratch with the demo data on every start, so the demo always looks
# fresh. (Anything visitors added is lost on restart; that is intended.)
# ─────────────────────────────────────────────────────────────────────────────
set -e

cd /var/www/html

echo "[rhlbd] Preparing the demo..."

# 1. An app key is needed to encrypt sessions/cookies. If Render did not set
#    one, create a fresh key for this run (fine: the data resets anyway).
if [ -z "${APP_KEY}" ]; then
    # key:generate needs an "APP_KEY=" line to fill in
    echo "APP_KEY=" > .env
    php artisan key:generate --force --no-interaction
fi

# 2. Fresh SQLite database with the demo data
rm -f database/database.sqlite
touch database/database.sqlite
php artisan migrate --force --seed --no-interaction

# 3. Make uploaded photos reachable at /storage/...
php artisan storage:link --force --no-interaction || true

# 4. Cache config, routes and views for speed
php artisan optimize --no-interaction

echo "[rhlbd] Demo ready."
