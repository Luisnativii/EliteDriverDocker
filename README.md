# EliteDriver

Proyecto dockerizado de EliteDriver con:

- Frontend en React + Vite
- Backend en Spring Boot
- Base de datos PostgreSQL
- Administración web de base de datos con pgAdmin

## Requisitos

- Docker Desktop instalado
- Docker Compose habilitado

## Cómo correr el proyecto

Desde la raíz del proyecto:

```bash
docker compose up -d --build
```

Esto levantará todos los servicios:

- `postgres`
- `pgadmin`
- `backend`
- `frontend`

## Cómo detener el proyecto

```bash
docker compose down
```

Si además quieres eliminar volúmenes de la base de datos:

```bash
docker compose down -v
```

## Links locales del proyecto

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8080](http://localhost:8080)
- Endpoint de prueba backend: [http://localhost:8080/api/vehicles](http://localhost:8080/api/vehicles)
- pgAdmin: [http://localhost:5050](http://localhost:5050)

## Credenciales de testing

### PostgreSQL

- Host: `localhost`
- Puerto: `5432`
- Base de datos: `elitedriver`
- Usuario: `postgres`
- Password: `postgres`

### pgAdmin

- URL: [http://localhost:5050](http://localhost:5050)
- Email: `admin@elitedriver.com`
- Password: `admin123`

Nota: el servidor de PostgreSQL ya queda preconfigurado dentro de pgAdmin.

### Usuario administrador sembrado por el backend

Al iniciar por primera vez, el backend crea un usuario administrador de prueba:

- Email: `admin@example.com`
- Password: `adminadmin`
- Rol: `ADMIN`

## Comandos útiles

Ver estado de los contenedores:

```bash
docker compose ps
```

Ver logs de todos los servicios:

```bash
docker compose logs -f
```

Ver logs de un servicio específico:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f pgadmin
```

Reconstruir todo desde cero:

```bash
docker compose down
docker compose up -d --build
```

## Estructura de servicios

- `frontend`: interfaz web de EliteDriver
- `backend`: API REST y lógica de negocio
- `postgres`: base de datos principal
- `pgadmin`: panel web para administrar PostgreSQL

## Notas

- El frontend consume el backend por proxy interno Docker, por lo que no hace falta configurar nada manualmente para desarrollo local.
- El backend ya está configurado para conectarse automáticamente a PostgreSQL dentro de Docker.
- Las variables de entorno principales están centralizadas en el archivo `.env`.
