#!/usr/bin/env bash
# Uso: deploy.sh <rama> <puerto>   (lo invoca .github/workflows/deploy.yml por SSH)
set -euo pipefail

BRANCH="$1"
PORT="$2"
cd "/srv/pis-$BRANCH"

git fetch --prune origin "$BRANCH"
git reset --hard "origin/$BRANCH"   # el estado de la VM es el de la rama, sin merges locales

COMPOSE_PROJECT_NAME="pis-$BRANCH" PORT="$PORT" docker compose up -d --build
docker image prune -f              # ponytail: sin esto el disco de la VM se llena en semanas
