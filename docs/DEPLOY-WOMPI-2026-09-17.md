# Despliegue Wompi — EliteDriver — 17 de septiembre de 2026

**Resultado: versión publicada y validada en el homelab, con Wompi en modo de desarrollo.**

[Abrir EliteDriver](https://elitedriver.luisnativii.site/)

## Estado inicial

- Proyecto: `/home/serverln/proyectos/EliteDriverDocker`.
- Git: `main`, commit `60aa124eeef909321161cc518350d21236045207`, sin cambios locales en el servidor antes de aplicar. Las imágenes anteriores no tenían una etiqueta de revisión Git; el commit del checkout está confirmado, pero no se puede certificar qué commit se usó para construir esas imágenes.
- Contenedores originales saludables: `elitedriverdocker-backend-1`, `elitedriverdocker-frontend-1`, `elitedriverdocker-postgres-1`.
- Imágenes anteriores: backend `f2f35f3b3761`, frontend `3aba377aae3c`, PostgreSQL `postgres:16-alpine`.
- Despliegue mediante Docker Compose, proyecto `elitedriverdocker`, con reinicio `unless-stopped`.
- Frontend: `127.0.0.1:5173`; backend: `127.0.0.1:18080`; PostgreSQL sin puerto publicado.
- Subdominio: `elitedriver.luisnativii.site`, atendido por el túnel existente hacia el frontend en el puerto 5173.
- PostgreSQL inicial: 1 usuario, 12 vehículos, 0 reservas, 4 tipos, 101 características, 62 imágenes adicionales y 0 registros de mantenimiento.

## Cambios realizados

- Implementación de Wompi El Salvador: OAuth privado en backend, enlaces por reserva, importe en dólares calculado y guardado en servidor, reutilización, sincronización del estado y recepción de notificaciones firmadas.
- El monto y la cantidad no pueden editarse en Wompi; cada enlace admite un solo pago exitoso. Se distingue `PAID_TEST` de un pago real.
- Las operaciones de pago requieren ser dueño de la reserva o administrador. Se verifican negocio, referencia, enlace, monto y modo al registrar un pago; las notificaciones repetidas se procesan sin duplicar el registro.
- Interfaz para reservar y pagar, retomar enlaces desde Mis reservas y verificar pagos.
- Nginx conserva la cabecera `wompi_hash`.
- Se eliminó la contraseña fija usada para crear administradores. La creación inicial requiere ahora configuración privada explícita y queda desactivada por defecto. La cuenta y contraseña existentes no se modificaron.
- `.env` del servidor conserva sus valores anteriores de PostgreSQL, JWT, puertos, CORS y configuración JVM. Se agregaron las siete variables de Wompi, con `WOMPI_ALLOW_PRODUCTION=false`; permisos `600`, fuera de Git. No se incluyen credenciales en este informe.
- Migración aplicada en una transacción: nueve campos opcionales de pago, dos restricciones de unicidad y validación del estado. La tabla de reservas pasó de cinco a catorce columnas; las filas originales no se alteraron.
- Dockerfiles: sin cambios. Compose agrega las variables de Wompi y las opciones privadas de creación inicial de administrador.
- Imágenes reemplazadas: ninguna. Assets y URLs de imágenes almacenadas en PostgreSQL conservaron sus huellas originales.
- El cambio local previo de galería de `VehiclesPage.jsx` sigue en el Mac y quedó fuera de este despliegue, para conservar el layout actual del servidor.

[Guía de uso y comportamiento](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/docs/WOMPI.md) · [Migración aplicada](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/docs/migrations/20260917-wompi-payments.sql)

### Archivos de implementación

Se aplicaron estos 34 archivos nuevos o modificados, además de este informe y del entorno privado `.env`:

- [.env.example](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/.env.example)
- [README.md](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/README.md)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/config/DataInitializer.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/config/DataInitializer.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/config/SecurityConfig.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/config/SecurityConfig.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/config/WompiConfiguration.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/config/WompiConfiguration.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/config/WompiProperties.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/config/WompiProperties.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/controller/PaymentController.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/controller/PaymentController.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/controller/ReservationController.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/controller/ReservationController.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/domain/dtos/PaymentLinkResponseDTO.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/domain/dtos/PaymentLinkResponseDTO.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/domain/dtos/ReservationResponseDTO.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/domain/dtos/ReservationResponseDTO.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/domain/entity/PaymentStatus.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/domain/entity/PaymentStatus.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/domain/entity/Reservation.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/domain/entity/Reservation.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/handlers/GlobalExceptionHandler.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/handlers/GlobalExceptionHandler.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/repositories/ReservationRepository.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/repositories/ReservationRepository.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/security/JwtAuthenticationFilter.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/security/JwtAuthenticationFilter.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/PaymentService.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/PaymentService.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/ReservationPricing.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/ReservationPricing.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/ReservationService.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/ReservationService.java)
- [apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/WompiClient.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/WompiClient.java)
- [apps/EliteDriverBackendSoft/src/main/resources/application.yml](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/main/resources/application.yml)
- [apps/EliteDriverBackendSoft/src/test/java/com/example/elitedriverbackend/config/DataInitializerTest.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/test/java/com/example/elitedriverbackend/config/DataInitializerTest.java)
- [apps/EliteDriverBackendSoft/src/test/java/com/example/elitedriverbackend/services/PaymentServiceTest.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/test/java/com/example/elitedriverbackend/services/PaymentServiceTest.java)
- [apps/EliteDriverBackendSoft/src/test/java/com/example/elitedriverbackend/services/ReservationPricingTest.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/test/java/com/example/elitedriverbackend/services/ReservationPricingTest.java)
- [apps/EliteDriverBackendSoft/src/test/java/com/example/elitedriverbackend/services/WompiClientTest.java](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverBackendSoft/src/test/java/com/example/elitedriverbackend/services/WompiClientTest.java)
- [apps/EliteDriverFrontEndSoft/nginx.conf](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverFrontEndSoft/nginx.conf)
- [apps/EliteDriverFrontEndSoft/src/components/customer/FacturationDetail.jsx](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverFrontEndSoft/src/components/customer/FacturationDetail.jsx)
- [apps/EliteDriverFrontEndSoft/src/components/reservation/ReservationPayment.jsx](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverFrontEndSoft/src/components/reservation/ReservationPayment.jsx)
- [apps/EliteDriverFrontEndSoft/src/hooks/useReservations.js](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverFrontEndSoft/src/hooks/useReservations.js)
- [apps/EliteDriverFrontEndSoft/src/pages/customer/MyReservationsPage.jsx](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverFrontEndSoft/src/pages/customer/MyReservationsPage.jsx)
- [apps/EliteDriverFrontEndSoft/src/services/paymentService.js](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverFrontEndSoft/src/services/paymentService.js)
- [apps/EliteDriverFrontEndSoft/src/services/reservationService.js](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/apps/EliteDriverFrontEndSoft/src/services/reservationService.js)
- [docker-compose.yml](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/docker-compose.yml)
- [docs/WOMPI.md](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/docs/WOMPI.md)
- [docs/migrations/20260917-wompi-payments.sql](/Users/luisnativii/Desktop/Proyects/EliteDriverDocker/docs/migrations/20260917-wompi-payments.sql)

### Assets conservados

Los assets provienen de `public` y `src/assets`; Vite incluye los importados en el frontend. Las fotografías de vehículos se sirven desde las URLs existentes guardadas en la base.

| Archivo | Formato real | Dimensiones |
| --- | --- | --- |
| `src/assets/png/plus.png` | PNG | 100 × 100 |
| `src/assets/png/PickupOptionMain.png` | PNG | 666 × 374 |
| `src/assets/png/SedanOptionMain.png` | PNG | 558 × 447 |
| `src/assets/png/SUVOptionMain.png` | PNG | 558 × 447 |
| `src/assets/jpg/CarroInfoPrincipal.jpg` | JPEG | 1920 × 1080 |
| `src/assets/jpg/CarroPaginaHomeBanner.jpg` | JPEG | 3000 × 2178 |
| `src/assets/jpg/PickupDetailOption.jpg` | JPEG | 746 × 498 |
| `src/assets/jpg/SUVOptionDetailPage.webp` | WebP | 3000 × 3000 |
| `src/assets/jpg/SedanOptionDetailMain.png` | JPEG | 800 × 600 |
| `public/EliteDrive.svg` | SVG | 800.000000pt × 312.000000pt |
| `public/vite.svg` | SVG | 31.88 × 32 |
| `src/assets/react.svg` | SVG | 35.93 × 32 |

## Deploy

- Backup inicial privado: `/home/serverln/backups/EliteDriverDocker/20260917T164630Z`. Contiene configuración, repositorio, fuente anterior, inventario y dump lógico PostgreSQL de 526062 bytes, verificado leyendo el archivo completo con `pg_restore`.
- Se creó y verificó un segundo dump justo antes de activar: `database-before-activation.dump`, dentro de ese respaldo.
- Recuperación disponible: `elitedriver-backend:rollback-20260917T164630Z` y `elitedriver-frontend:rollback-20260917T164630Z`.
- Construcción secuencial de backend y frontend desde una copia candidata; activación tras autorización explícita de la migración.
- Imágenes nuevas:
  - `elitedriver-backend:wompi-20260917T164630Z` — `sha256:78ce4118c309ffb9b5322801bd53e9026fe54ce5b4ef860e5ecffbd058726c23`, arquitectura `amd64`.
  - `elitedriver-frontend:wompi-20260917T164630Z` — `sha256:167a4cf22796996098b3ae82a108c6b296e16b2cad96f09a5fa303f30839951c`, arquitectura `amd64`.
- Las etiquetas `elitedriver-backend:local` y `elitedriver-frontend:local` apuntan a las imágenes activadas, conservando la configuración habitual de Compose.
- Recreados: `elitedriverdocker-backend-1` y `elitedriverdocker-frontend-1`, uno por uno, esperando su estado saludable.
- Conservados con los mismos identificadores y horas de arranque: PostgreSQL, CV y Portainer. Cloudflare Tunnel mantiene el mismo proceso y su configuración.
- Volumen preservado: `elitedriverdocker_postgres_data`; mismos montajes y contenedor PostgreSQL.
- No se eliminaron volúmenes, no se reinstaló software, no se modificaron DNS o túneles, no se publicaron puertos nuevos y no se ejecutó una restauración sobre la base.

## Pruebas

- Backend: compilación y 28 tests aprobados en el homelab.
- Frontend: build aprobado; revisión de los archivos de Wompi sin errores. La revisión general conserva 53 errores y 8 advertencias previos en archivos ajenos a esta implementación.
- Nginx: configuración de la nueva imagen validada.
- Health del backend consulta PostgreSQL y devuelve `status=UP`, `database=UP`. Frontend y health del dominio responden 200.
- Frontend → backend → PostgreSQL: el dominio devuelve los 12 vehículos; el navegador muestra Disponibles (12), carga los logos y las 12 fotos principales sin alertas visibles.
- Dieciséis comprobaciones HTTP después de activar:

| Comprobación | Resultado HTTP |
| --- | --- |
| Salud de API y PostgreSQL | 200 esperado, aprobado |
| Salud del frontend | 200 esperado, aprobado |
| Salud desde el dominio | 200 esperado, aprobado |
| Página publicada | 200 esperado, aprobado |
| Vehículos desde frontend, API y base | 200 esperado, aprobado |
| Consulta de reservas | 200 esperado, aprobado |
| Pago sin sesión rechazado | 403 esperado, aprobado |
| Token inválido rechazado | 403 esperado, aprobado |
| Notificación sin firma rechazada | 401 esperado, aprobado |
| Firma incorrecta rechazada | 401 esperado, aprobado |
| Notificación firmada inocua a través del dominio | 200 esperado, aprobado |
| Cuerpo modificado tras firmar rechazado | 401 esperado, aprobado |
| Sesión autenticada y consulta de usuario | 200 esperado, aprobado |
| Ruta de estado para reserva inexistente | 404 esperado, aprobado |
| Ruta de creación para reserva inexistente | 404 esperado, aprobado |
| Fechas invertidas rechazadas sin crear reserva | 400 esperado, aprobado |

- Wompi desde el homelab: credenciales OAuth válidas, negocio correspondiente y `estaProductivo=false`; los cobros reales siguen bloqueados por la aplicación.
- Datos: las huellas de las siete tablas, tomando sus columnas originales, coinciden exactamente con el respaldo. No se crearon clientes, vehículos ni reservas de prueba en producción.
- Logs: ningún error crítico desde la activación; frontend, backend y PostgreSQL saludables. Los últimos cien registros de cada servicio se guardaron de forma privada dentro del respaldo.
- Seguridad: entorno privado y fuera de Git; escaneo sin credenciales de Wompi, PostgreSQL o JWT en archivos del repositorio.
- Prueba local previa: enlace real Wompi de desarrollo por $59.97, calculado en servidor, reutilización y consulta de estado. No se ingresó una tarjeta ni se completó una transacción; la aprobación completa del checkout queda para la prueba del usuario.
- Algunas solicitudes con User-Agent de Python son bloqueadas por Cloudflare; las solicitudes normales y la notificación firmada de esta validación llegan correctamente. No se cambió esa política.
- Límites existentes de la integración: no hay vencimiento automático de reservas pendientes ni devoluciones automáticas; los límites de red al crear enlaces requieren revisar el panel antes de reintentar si el resultado es incierto.

## Recursos

- Servidor informa 4 CPU y 5.7 GiB efectivos de RAM; después de activar: aproximadamente 1.7 GiB disponibles, swap sin uso.
- Espacio disponible: aproximadamente 146 GiB en los sistemas de archivos relevantes.
- Docker 29.7.2 operativo, cinco contenedores habituales en ejecución, sin servicios permanentes adicionales. Se realizaron los builds de uno en uno.

Consumo registrado de contenedores:

```text
elitedriverdocker-frontend-1 | 4.469MiB / 5.691GiB | 0.00%
elitedriverdocker-backend-1 | 586.2MiB / 5.691GiB | 0.15%
elitedriverdocker-postgres-1 | 43.7MiB / 5.691GiB | 0.02%
cv-luisnativii | 6.48MiB / 5.691GiB | 0.00%
portainer | 44.02MiB / 5.691GiB | 0.03%
```

## Git

- Branch final: `main`, tanto en Mac como en homelab.
- Commit final: `60aa124eeef909321161cc518350d21236045207`; la versión desplegada incorpora los cambios Wompi sin commit.
- Servidor: 34 archivos de implementación nuevos/modificados más este informe, pendientes de commit. `.env` permanece ignorado.
- Mac: esos mismos archivos de implementación más el informe; se conserva además el cambio local previo de `VehiclesPage.jsx`, que no se desplegó.
- No se hizo commit ni push a GitHub.

Para probar en el dominio: inicia sesión o registra un cliente, selecciona vehículo y fechas, pulsa **Reservar y pagar con Wompi** y completa el checkout de prueba. El regreso dirige a **Mis reservas**, donde puedes consultar **Verificar pago**.
