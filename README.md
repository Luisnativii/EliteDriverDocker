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

## Precios y retención de reservas

La tarifa diaria publicada ya incluye IVA. El total de una reserva nueva es
**días × tarifa diaria**, sin agregar IVA: $29.99 por 3 días = $89.97.
El importe guardado al crear una reserva es el que se envía a Wompi; las reservas
anteriores conservan su importe pactado.

`RESERVATION_HOLD_MINUTES=10` define la ventana para completar el pago. Al vencer,
la reserva pendiente se libera y el vehículo vuelve a estar disponible para esas
fechas. El contador usa `holdExpiresAt`, que envía el servidor. Una renovación
concede otros 10 minutos si el vehículo sigue libre. Un valor explícito en `.env`
tiene prioridad sobre el predeterminado de Compose; `0` desactiva el vencimiento.

## Estado de vehículos y períodos fuera de servicio

En **Gestión de Vehículos** cada auto puede estar **Activo** o **Inactivo**.
Un vehículo activo también puede tener varios períodos fuera de servicio por fechas,
con motivo interno opcional. Los días de inicio y fin están incluidos. Al terminar
un período, vuelve a estar disponible si está activo y no tiene otra ocupación.

Los bloqueos no pueden solaparse entre sí ni con reservas pendientes o pagadas.
Para desactivar un auto con reservas vigentes hay que resolver esas reservas primero.
Crear una reserva, renovar su ventana de pago y guardar un bloqueo comprueban la
disponibilidad en el servidor; reserva y bloqueo usan el mismo bloqueo de concurrencia.

El módulo de mantenimiento, sus alertas, historial y cálculo por kilómetros fueron
retirados. El kilometraje se conserva como dato informativo. La migración automática
convierte los estados anteriores y retira la tabla y columna de mantenimiento;
conserva vehículos, usuarios y reservas. Ver [verificación](docs/VERIFICACION-DISPONIBILIDAD-2026-10-20.json).

## Proveedores y clientes (v1.3.1)

En **Proveedores** el administrador registra al propietario externo, sus datos de
contacto y notas internas. Al crear o editar un vehículo puede elegir un proveedor;
si lo deja vacío se considera **Propio**. La propiedad se combina con los filtros
existentes de tipo, estado y fechas. Un proveedor con vehículos asignados debe
reasignarlos antes de eliminarse. Estos datos solo se entregan a administradores.

En **Clientes** se muestran las cuentas de clientes, fecha de creación, último
acceso e historial completo de reservas al abrir una persona. Se ordenan primero
los clientes con alquiler real activo, luego quienes tienen pago pendiente con su
contador y después las demás cuentas. El mes inicial es el actual; las flechas o
el selector permiten consultar meses anteriores y volver al actual.

Las estadísticas mensuales cuentan clientes nuevos, clientes únicos que alquilaron
y alquileres confirmados que coinciden con las fechas del mes. Los pagos de prueba
no se incluyen. Las cifras de actividad y pagos pendientes corresponden al momento
actual. Las fechas históricas de registro/acceso no disponibles aparecen como
**No registrado**; desde esta versión se guardan al registrar/iniciar sesión.

La migración agrega proveedores, una relación opcional en vehículos y fechas
opcionales en usuarios; conserva los datos existentes. Detalles y comprobaciones
en [cambios de administración](docs/CAMBIOS-PROVEEDORES-CLIENTES-2026-10-20.md).

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
