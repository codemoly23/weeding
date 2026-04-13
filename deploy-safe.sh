#!/bin/bash
set -e

# ============================================
# Weeding (Ceremoney) — Safe Deploy Script
# ============================================
APP_NAME="weeding"
APP_DIR="/home/ubuntu/weeding"
PORT=3009
BRANCH="main"
SSH_KEY="/home/ubuntu/.ssh/weeding_deploy"

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m"

log()   { echo -e "${GREEN}[$(date +"%Y-%m-%d %H:%M:%S")]${NC} $1"; }
error() { echo -e "${RED}[$(date +"%Y-%m-%d %H:%M:%S")] ERROR:${NC} $1"; }
warn()  { echo -e "${YELLOW}[$(date +"%Y-%m-%d %H:%M:%S")] WARNING:${NC} $1"; }

rollback() {
    error "$1"
    if [ -d "$APP_DIR/.next-old" ]; then
        warn "Rolling back to previous build..."
        rm -rf "$APP_DIR/.next"
        mv "$APP_DIR/.next-old" "$APP_DIR/.next"
        PM2_HOME=/home/ubuntu/.pm2 pm2 restart "$APP_NAME" 2>/dev/null || true
        PM2_HOME=/home/ubuntu/.pm2 pm2 save 2>/dev/null || true
        log "Rolled back to previous build"
    else
        warn "No previous build found for rollback"
        PM2_HOME=/home/ubuntu/.pm2 pm2 stop "$APP_NAME" 2>/dev/null || true
        PM2_HOME=/home/ubuntu/.pm2 pm2 save 2>/dev/null || true
    fi
    exit 1
}

cd "$APP_DIR"

LOCKFILE="/tmp/deploy-${APP_NAME}.lock"
if [ -f "$LOCKFILE" ]; then
    LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCKFILE" 2>/dev/null || echo 0) ))
    if [ "$LOCK_AGE" -gt 600 ]; then
        warn "Stale lock file found (${LOCK_AGE}s old). Removing it."
        rm -f "$LOCKFILE"
    else
        error "Another deployment is already running (lock age: ${LOCK_AGE}s). Exiting."
        exit 1
    fi
fi
trap "rm -f $LOCKFILE" EXIT
touch "$LOCKFILE"

log "=========================================="
log "Starting deployment for $APP_NAME"
log "=========================================="

log "Pulling latest code from $BRANCH..."
GIT_SSH_COMMAND="ssh -i $SSH_KEY -o StrictHostKeyChecking=no" git pull origin "$BRANCH" || rollback "git pull failed"

log "Installing dependencies..."
npm install --production=false || rollback "npm install failed"

log "Running Prisma generate..."
npx prisma generate || rollback "prisma generate failed"

log "Running Prisma db push..."
npx prisma db push --skip-generate || rollback "prisma db push failed"

log "Backing up current build..."
if [ -d ".next" ]; then
    rm -rf .next-old
    mv .next .next-old
fi

log "Building application..."
npm run build || rollback "npm run build failed"

log "Restarting PM2 process..."
PM2_HOME=/home/ubuntu/.pm2 pm2 restart "$APP_NAME" || rollback "pm2 restart failed"
PM2_HOME=/home/ubuntu/.pm2 pm2 save > /dev/null 2>&1 || true

sleep 3
log "Running health check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:${PORT}/" 2>/dev/null || echo "000")
if [ "$HEALTH_RESPONSE" != "200" ] && [ "$HEALTH_RESPONSE" != "307" ] && [ "$HEALTH_RESPONSE" != "302" ]; then
    rollback "Health check failed (HTTP $HEALTH_RESPONSE)"
fi
log "Health check passed (HTTP $HEALTH_RESPONSE)"

rm -rf .next-old 2>/dev/null

log "=========================================="
log "Deployment completed successfully!"
log "=========================================="
exit 0
