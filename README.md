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

## Notas

- El endpoint `/health` del backend consulta PostgreSQL con `SELECT 1`.
- Las variables principales están documentadas en `.env.example`.
- Para producción, usa secretos fuertes y apunta Cloudflare Tunnel al puerto local del frontend.
