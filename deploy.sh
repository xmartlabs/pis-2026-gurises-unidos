#!/usr/bin/env bash
# Levanta el entorno <rama> en el puerto <puerto>. Asume que el clon ya está en el commit deseado:
# el workflow hace el fetch/reset antes de invocarlo (ver .github/workflows/deploy.yml).
# A mano: git pull && ./deploy.sh staging 3001
set -euo pipefail

BRANCH="$1"
PORT="$2"
cd "/srv/pis-$BRANCH"

COMPOSE_PROJECT_NAME="pis-$BRANCH" PORT="$PORT" docker compose up -d --build
docker image prune -f              # ponytail: sin esto el disco de la VM se llena en semanas
