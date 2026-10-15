#!/usr/bin/env bash
# Despliega el homelab usando como versión el tag de git actual.
#
#   scripts/deploy.sh              # usa el tag exacto de HEAD
#   scripts/deploy.sh v1.0.3       # exige que HEAD coincida con ese tag
#
# Escribe APP_VERSION en el .env del servidor ANTES de construir, para que el
# frontend y el backend que corren coincidan con el tag desplegado.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

EXPECTED="${1:-}"
REMOTE_DIR=/home/serverln/proyectos/EliteDriverDocker

echo "== determining version =="
git fetch origin --tags -q

if git describe --tags --exact-match HEAD >/dev/null 2>&1; then
  VERSION="$(git describe --tags --exact-match HEAD)"
elif [ -n "$EXPECTED" ]; then
  echo "ERROR: HEAD no está en el tag $EXPECTED" >&2
  exit 1
else
  # Sin tag exacto: se puede desplegar, pero se marca como no liberado.
  NEAREST="$(git describe --tags --abbrev=0 2>/dev/null || echo 'sin-tag')"
  VERSION="${NEAREST}+$(git rev-parse --short HEAD)"
  echo "AVISO: HEAD no tiene tag; se despliega como $VERSION"
fi

if [ -n "$EXPECTED" ] && [ "$EXPECTED" != "$VERSION" ]; then
  echo "ERROR: esperabas $EXPECTED pero HEAD es $VERSION" >&2
  exit 1
fi

echo "VERSION=$VERSION  ($(git rev-parse --short HEAD))"

# La versión viaja como $1 para que el script remoto quede literal (here-doc
# entrecomillado) y no se expongan secretos del .env.
echo "== build + up on homelab =="
ssh serverln@homelab.local "cd $REMOTE_DIR && bash -s -- '$VERSION'" <<'REMOTE'
set -euo pipefail
VERSION="$1"

# Escribe APP_VERSION en .env sin imprimir ningún secreto.
ENV_FILE=.env
if grep -q '^APP_VERSION=' "$ENV_FILE"; then
  sed -i "s|^APP_VERSION=.*|APP_VERSION=$VERSION|" "$ENV_FILE"
else
  printf '\n# Escrito por scripts/deploy.sh\nAPP_VERSION=%s\n' "$VERSION" >> "$ENV_FILE"
fi
echo "APP_VERSION=$(grep '^APP_VERSION=' "$ENV_FILE" | cut -d= -f2-)"

git fetch origin -q
git reset --hard origin/main | tail -1
echo "HEAD=$(git rev-parse --short HEAD)  dirty=$(git status --porcelain | wc -l)"

docker compose build
docker compose up -d
REMOTE

echo "== waiting for healthy =="
ssh serverln@homelab.local "cd $REMOTE_DIR && bash -s" <<'REMOTE'
set -uo pipefail
for _ in $(seq 1 36); do
  b=$(docker inspect -f '{{.State.Health.Status}}' elitedriverdocker-backend-1 2>/dev/null)
  f=$(docker inspect -f '{{.State.Health.Status}}' elitedriverdocker-frontend-1 2>/dev/null)
  [ "$b" = healthy ] && [ "$f" = healthy ] && break
  sleep 5
done
docker compose ps --format '{{.Name}}  {{.Status}}'
REMOTE

echo "== verifying =="
FRONT=$(ssh serverln@homelab.local \
  "curl -s http://127.0.0.1:5173/ | grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' | head -1")
HEALTH=$(ssh serverln@homelab.local "curl -s http://127.0.0.1:18080/health")
echo "bundle:  $FRONT"
echo "health:  $HEALTH"
echo
echo "Deploy $VERSION completado."