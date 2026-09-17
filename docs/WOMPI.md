# Wompi El Salvador en EliteDriver

La integración crea un enlace por reserva con el importe en dólares calculado en el servidor: días de alquiler × tarifa del vehículo. El precio queda guardado al crear la reserva y no cambia si después se modifica la tarifa. El cliente completa el pago en la interfaz de Wompi.

## Probar en esta computadora

El archivo `.env` local ya contiene las credenciales suministradas, con permisos de lectura restringidos y fuera de Git. No copies las credenciales a archivos `VITE_*`, al código ni a este documento.

```bash
docker compose -p elitedriver-wompi up -d --build
```

Abre [EliteDriver local](http://localhost:5173/). La instalación dejó un cliente de pruebas con correo `cliente.wompi@example.com` y contraseña `PruebaWompi2026!`, un vehículo de prueba a $19.99 por día y una reserva del 1 al 4 de octubre de 2026 por $59.97. Estos datos pertenecen a la base local del proyecto `elitedriver-wompi`.

En **Mis reservas**, pulsa **Pagar con Wompi** para retomar el enlace de esa reserva. También puedes registrar otro cliente, seleccionar fechas distintas y pulsar **Reservar y pagar con Wompi**.

Después de completar un pago de prueba, Wompi regresa a **Mis reservas**. La aplicación consulta el enlace directamente a Wompi para conocer el resultado. **Verificar pago** permite repetir esta consulta. Los parámetros de regreso no se utilizan para marcar una reserva como pagada.

Wompi no puede llamar a una dirección `localhost` de esta computadora. La consulta al proveedor permite probar sin un túnel público. Para probar también las notificaciones automáticas, configura una URL HTTPS pública que dirija a este backend.

El negocio debe permanecer en **desarrollo** en el panel de Wompi. `WOMPI_ALLOW_PRODUCTION=false` bloquea la creación o reutilización de enlaces cuando el negocio está en producción; el modo definitivo de los cobros lo controla Wompi. Un pago aprobado de prueba se muestra como **Pago de prueba aprobado** y se guarda como `PAID_TEST`; no representa un cobro real.

Detener los servicios de prueba conservando la base:

```bash
docker compose -p elitedriver-wompi stop
```

## Instalar en el home lab

Lleva el código actualizado al servidor y agrega estas variables al `.env` de ese servidor, conservando sus credenciales actuales de PostgreSQL y JWT:

```dotenv
WOMPI_ENABLED=true
WOMPI_ALLOW_PRODUCTION=false
WOMPI_APP_ID=<App ID del negocio>
WOMPI_API_SECRET=<API Secret del negocio>
WOMPI_REDIRECT_URL=https://elitedriver.luisnativii.site/customer/my-reservations
WOMPI_WEBHOOK_URL=https://elitedriver.luisnativii.site/api/payments/wompi/webhook
WOMPI_NOTIFICATION_EMAILS=
```

Agrega `https://elitedriver.luisnativii.site` a `APP_CORS_ALLOWED_ORIGINS`. Reconstruye los servicios con `docker compose up -d --build`, usando el nombre de proyecto que ya tiene el servidor.

El proxy Nginx conserva la cabecera `wompi_hash`. El endpoint público de notificaciones acepta solicitudes sin sesión del cliente y valida la firma HMAC-SHA256 del cuerpo original usando el API Secret. También comprueba negocio, referencia de reserva, enlace, monto y modo de prueba/producción. Las notificaciones repetidas no duplican el pago.

La migración revisable está en [20260917-wompi-payments.sql](migrations/20260917-wompi-payments.sql). Agrega nueve columnas opcionales y dos restricciones de unicidad a `reservations`, dentro de una transacción con un máximo de cinco segundos de espera por bloqueos. Conserva las filas y relaciones existentes. Debe respaldarse la base antes de aplicarla. La configuración `SPRING_JPA_HIBERNATE_DDL_AUTO=update` también puede agregar esos campos; una instalación con `validate` o `none` requiere aplicar la migración explícitamente. No se crean enlaces ni se cobran reservas automáticamente.

Antes de probar notificaciones en el home lab, comprueba que Wompi pueda acceder al endpoint. Un POST sin firma que alcance la versión con Wompi debe responder **401**. La versión anterior responde **403** a esa ruta porque aún no incluye el webhook; ese resultado por sí solo no indica un bloqueo de Cloudflare.

La aplicación ya no incluye una contraseña fija para crear administradores. Para una base nueva, la creación inicial requiere configurar explícitamente `APP_BOOTSTRAP_ADMIN_EMAIL` y `APP_BOOTSTRAP_ADMIN_PASSWORD` en el entorno privado. Sin esas variables no se crea esa cuenta. Las cuentas existentes y sus contraseñas se conservan.

## Comportamiento y límites

- El importe y la cantidad no son editables en Wompi; cada enlace permite un solo pago exitoso.
- La creación, consulta y cancelación del pago requiere ser dueño de la reserva o administrador.
- Si falla la generación del enlace, la reserva sigue guardada y puede retomarse desde el formulario o desde Mis reservas.
- Cancelar una reserva con enlace pendiente desactiva el enlace y conserva la referencia para registrar notificaciones que lleguen después. Las reservas con pago registrado requieren que el negocio gestione la cancelación; la integración no ejecuta devoluciones.
- No se ha implementado vencimiento automático de reservas pendientes: siguen ocupando las fechas hasta su cancelación.
- Si una creación de enlace termina en un fallo de red después de llegar a Wompi, verifica el panel antes de reintentar: la API no documenta una clave de idempotencia para esa operación.
- La prueba de instalación verifica credenciales, generación real del enlace en desarrollo, monto, reutilización y consulta del estado. Completar el formulario de pago queda para la prueba del usuario.

## API del aplicativo

| Operación | Ruta |
| --- | --- |
| Crear o retomar enlace | `POST /api/reservations/{id}/payment-link` |
| Consultar y sincronizar pago | `GET /api/reservations/{id}/payment` |
| Recibir notificaciones firmadas | `POST /api/payments/wompi/webhook` |

## Documentación del proveedor

- [Autenticación](https://docs.wompi.sv/autenticacion/autenticacion)
- [Crear enlace de pago](https://docs.wompi.sv/metodos-api/enlace-de-pago)
- [Consultar enlace de pago](https://docs.wompi.sv/metodos-api/obtener-enlace-de-pago-por-id)
- [Validar notificaciones](https://docs.wompi.sv/webhook/validar-webhook)
- [Transacciones de prueba](https://docs.wompi.sv/metodos-api/transaccion_prueba)
