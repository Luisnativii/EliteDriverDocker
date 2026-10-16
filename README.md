# EliteDriver

Proyecto dockerizado de EliteDriver preparado para levantar el stack principal con Docker Compose:

- Frontend en React + Vite, servido con Nginx
- Backend/API en Spring Boot
- Base de datos PostgreSQL

## Requisitos

- Docker instalado
- Docker Compose habilitado

## Configuración

Crea tu archivo local de variables desde el ejemplo:

```bash
cp .env.example .env
```

Ajusta como mínimo:

- `POSTGRES_PASSWORD`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`

No subas `.env` al repositorio.

## Cómo correr el proyecto

Desde la raíz:

```bash
docker compose up -d --build
```

Esto levantará:

- `postgres`
- `backend`
- `frontend`

PostgreSQL solo queda expuesto dentro de la red de Docker. Frontend y backend quedan publicados en `127.0.0.1` para uso local o para un reverse proxy/túnel del host.

## Links locales

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend health: [http://localhost:8080/health](http://localhost:8080/health)
- API vía frontend proxy: [http://localhost:5173/api/vehicles](http://localhost:5173/api/vehicles)
- API directa local: [http://localhost:8080/api/vehicles](http://localhost:8080/api/vehicles)

## Usuario administrador sembrado

Al iniciar por primera vez, el backend crea un usuario administrador de prueba:

- Email: `admin@example.com`
- Password: `adminadmin`
- Rol: `ADMIN`

## Comandos útiles

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

Reconstruir todo desde cero:

```bash
docker compose down
docker compose up -d --build
```

Eliminar también la base local:

```bash
docker compose down -v
```

## Arquitectura

- `frontend`: Nginx sirve los assets compilados de React/Vite y proxifica `/api` hacia `backend:8080`.
- `backend`: Spring Boot expone la API REST y conecta a PostgreSQL por la red interna de Docker.
- `postgres`: PostgreSQL 16 Alpine con volumen persistente `postgres_data`.

## Releases y despliegue al homelab

Cada cambio terminado se publica como un tag `vX.Y.Z` y se despliega con:

```bash
git tag -a v1.0.3 -m "descripcion"
git push origin main --follow-tags
./scripts/deploy.sh v1.0.3
```

`scripts/deploy.sh` usa el tag de git como versión, la escribe en `APP_VERSION`
antes de construir para que frontend y backend coincidan, y verifica el bundle y
`/health` al terminar. Si pasas un tag que no corresponde a `HEAD`, se detiene.

### Por qué el despliegue no ocurre en GitHub Actions

El workflow `CI/CD` corre **las pruebas** en cada push a `main` y **publica las
imágenes** al liberar un tag. No despliega al homelab, y es a propósito: los
runners de GitHub se ejecutan en la nube y no tienen ruta hacia una red local de
casa, así que un `ssh homelab.local` desde allí no puede funcionar.

Publicar en el servidor se hace desde tu equipo con el comando de arriba. Si se
quiere automatizar de verdad, la vía es un runner instalado en el homelab, no
exponer SSH a internet.

### Ver qué versión está en el servidor

Con la sesión de administrador abierta, el panel muestra la versión en la
esquina inferior izquierda. Al pulsarla:

- `frontend`: la versión compilada en el bundle que sirve el navegador.
- `backend`: la que responde `GET /api/version`.

Si difieren, o el backend responde `sin /api/version`, una de las dos imágenes
quedó desactualizada. Un punto verde indica que ambas coinciden.

## Notas

- La protección de reservas simultáneas se instala automáticamente al iniciar el backend, mediante una restricción PostgreSQL con `btree_gist`. Las reglas de calendario usan `America/El_Salvador`. Detalles y pruebas en [Correcciones F01–F05](docs/CORRECCIONES-F01-F05-2026-10-16.md).

- La integración de Wompi El Salvador y las pruebas locales se explican en [docs/WOMPI.md](docs/WOMPI.md).

- El endpoint `/health` del backend consulta PostgreSQL con `SELECT 1`.
- `GET /api/version` requiere sesión; no se expone públicamente.
- Las variables principales están documentadas en `.env.example`.
- Para producción, usa secretos fuertes y apunta Cloudflare Tunnel al puerto local del frontend.
