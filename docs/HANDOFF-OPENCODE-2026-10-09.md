# HANDOFF — EliteDriverDocker — 2026-10-09
Contexto completo del chat OpenCode para continuar en otra computadora.
Repo: https://github.com/Luisnativii/EliteDriverDocker.git (rama `main`).
Stack: Spring Boot 3.5 + Java 21 + PostgreSQL 16 + React 19 + Vite 6 + Nginx + Wompi SV. Dominio: `elitedriver.luisnativii.site` (Cloudflare Tunnel). Negocio: alquiler vehículos El Salvador, solo Sedan/SUV/PickUp (SIN Microbus por decisión 2026-10-08). Precios base + IVA 13%. Sin depósito. Edad mínima 18.

## 1. Auditoría pre-lanzamiento (no código) — veredicto: NO APTO aún, semáforo ROJO
- Sin T&C, Privacidad, Cookies, Aviso Legal, footer, consentimiento DUI. Ley Datos Personales SV vigente (nov-2024, reforma sep-2026), Ley Consumidor art. 4/13-C + registro e-commerce Defensoría 20 días, DTE Hacienda obligatorio.
- Copyright ambiguo `EliteDrive vs EliteDriver + equipo Asesuisa UCA`: falta cesión derechos.
- Sin contrato alquiler (edad/licencia/depósito/seguro/km/combustible), sin reembolsos, sin facturación.
- Servidor casa + K8s: riesgo ISP/CGNAT/cortes/sin SLA. Recomendado: quedarse en Compose + Tunnel + UPS + backups off-site. K8s (k3s) solo con 2 nodos.
- Pendiente: generar 4 textos legales (pedir al usuario: razón social, NIT/NRC, contacto, dominio final, depósito, cancelación).

## 2. Auditoría ciberseguridad — hallazgos y estado
- C1 (CRÍTICO, corregido): `GET /api/reservations` y `/date` eran `permitAll` y devolvían DUI+email. Cerrados.
- C2 (CRÍTICO, corregido): IDOR — cualquier logueado leía reservas ajenas (`/{id}`, `/user`, `/vehicle`, `/vehicleType`). Ahora dueño/ADMIN.
- H1: JWT 15d en localStorage sin revocación → bajado a 8h (`JWT_EXPTIME=28800000`) + fail-fast si secreto débil. Falta refresh rotation a cookie httpOnly (futuro).
- H2: sin rate-limit → Nginx `limit_req` login 5r/m, api 60r/m + `client_max_body_size 100k`.
- H3: registro solo `@NotBlank`, `confirmPassword` ignorado → validación fuerte (10 chars letra+número, DUI `00000000-0`, tel `0000-0000`, fecha real, edad 18+, email lower, DUI único).
- M: `GlobalExceptionHandler` devolvía `ex.getMessage()` (fuga SQL) → genérico; `TRACE BasicBinder` (volcaba PII) → WARN; CORS `*` + credenciales → headers explícitos; `validateUrl` aceptaba http → solo https (http solo localhost); `findAll()` en memoria → queries `findByUser_Id/findByVehicle_Id`; `VehicleResponseDTO.insurancePhone+maintenanceRecords` públicos → nulleados a no-admin.
- Verificado local 2026-10-09: batería 12/12 (solape 400, lista global customer 403/admin 200, availability pública 200 sin PII, cross-user 403, payment-link sin Wompi 503, registro débil/menor/confirm 400).

## 3. Archivos seguridad tocados (backend)
`config/SecurityConfig.java` (cierre + CORS), `security/JwtService.java` (fail-fast secreto), `security/CustomUserDetailsService.java` (msg genérico), `services/AuthService.java` (confirm+fortaleza+DUI único+edad18+email lower+NPE birth), `controller/AuthController.java` (quitó `@CrossOrigin` duplicado), `controller/ReservationController.java` (auth dueño/admin + `GET /availability` público DTO `ReservationAvailabilityDTO.java` nuevo + `/date` sin PII a no-admin + `/vehicle|/vehicleType` solo ADMIN con DTO), `controller/VehicleController.java` (strip públicos + eliminados `/import/carvi`, `/by-capacity`, `/available`, `/by-type`), `services/VehicleService.java` (borrado Carvi/capacity/available/byType), `services/ReservationService.java` (queries eficientes + `getReservationsForAvailability`), `repositories/ReservationRepository.java` (`findByUser_Id/findByVehicle_Id`), `repositories/UserRepository.java` (`existsByDui`), `repositories/VehicleRepository.java` (quitados `findByCapacity/findAvailableBetween` roto), `services/PaymentService.java` (https estricto), `services/ReservationPricing.java` (**+IVA 13%**: total = días×precio×1.13), `handlers/GlobalExceptionHandler.java` (genéricos), `config/DataInitializer.java` (sin Microbus), `resources/application.yml` (logs WARN, JWT 8h), `domain/dtos/RegisterRequest.java` (patterns), `domain/dtos/ReservationAvailabilityDTO.java` (nuevo), borrado `domain/dtos/VehicleTypeDTO.java`. Tests: `ReservationControllerTest` (3er arg UserRepository), `ReservationPricingTest` (67.77 con IVA).

## 4. Google Login — investigado, NO implementado (factible 5-7d, hacer después del hardening)
Usar GIS `@react-oauth/google` + `POST /api/auth/google {idToken}` validando `iss/aud/exp/email_verified` con `google-api-client`, emitir JWT propio. NO usar `oauth2-client` (choca con stateless). Bloqueo: Google no da DUI/tel/fecha → Opción A recomendada (cuenta parcial `provider=GOOGLE, profileComplete=false` + `/completar-perfil`) u Opción B (wizard pide DUI en mismo paso). Riesgo takeover si email LOCAL existe → exigir `email_verified` + `googleSub` + vinculación con password. Requiere migración `User` nullable + `GOOGLE_CLIENT_ID`.

## 5. Wompi prod — investigado, NO activado (hacer después)
Estado: `WOMPI_ENABLED=false`, `WOMPI_ALLOW_PRODUCTION=false` (bloquea cobro real por diseño). Checklist: negocio verificado productivo, AppID+Secret prod en `.env 600`, URLs https registradas, `ALLOW_PRODUCTION=true`, pruebas 401/PAID/PAID_TEST/idempotencia, DTE. Tiempos medidos en código: 1er enlace 1.1-2.9s caliente (token+Aplicativo+EnlacePago secuenciales, TX abierta, pool 5), retomar 0.9-2.3s, polling hasta 8 intentos/90s. Optimizar luego: cache env 5-10min, TX corta, warmup token, Abort 30s frontend.

## 6. Frontend móvil + imágenes + admin (auditoría dura)
- Móvil no era mobile-first: Tailwind v3-config ignorado en v4, fuentes 10px, `overflow-x:hidden`, header que desaparece, breakpoints 768 vs 1024 rotos, Home duplica DOM, `text-8xl`, cards `hover:scale`, flechas 32px, `py-25` inválido, grid sin `sm`, 0 `lazy/srcSet`, 2 calendarios, bundle eager, toast top-right.
- Imágenes: NO hay upload, solo URLs externas en `mainImageUrl/listImageUrls` (Postgres, sin S3). Validación solo sintaxis http(s). Riesgos hotlink/tracking/SVG/VARCHAR255. `multipart 20MB` huérfano.
- Admin: ver lista + DELETE solo PENDING, crear/editar parcial, Kanban sin crear registros. Falta: reembolsos, facturas, usuarios/roles, auditoría, bloqueos por rango, reportes netos (el `totalRevenue` suma bruto; `useDashboard.js` 455 líneas muerto sumaba hasta PENDING). `ProtectedRoute` solo frontend (bypass con localStorage, backend ya lo bloquea). Doble fetch 30s (calendario instancia 2º hook). Kanban HTML5 DnD = 0 táctil.

## 7. Fixes 1 y 2 aplicados (funnel móvil)
- `VehiclesPage.jsx`: migrada de `getAllReservations` (ahora 403) a `GET /availability` público + `toBackendDate()` (frontend yyyy-MM-dd → backend dd-MM-yyyy), refetch por rango, filtros con `role=tab min-h-11`, grid `sm:2 lg:3`, `pt-24`. `VehicleCard`: `aspect-[4/3] object-cover lazy`, flechas 44px, dots táctiles con contador, sin `hover:scale` móvil, botón `disabled` real mismo-día, precio con `pricePerDay`.
- `VehicleTypeDetailPage.jsx`: eliminado `navigate('/reservation-page')` sin ID (caía a no encontrado); CTA `Ver Modelos Disponibles` → `/vehicles` con `state:{type}` (VehiclesPage pre-filtra) + botón Volver + sticky CTA móvil con safe-area. `DetailHeaderSection` sin `min-h-screen`, imagen `aspect-[4/3] lazy`. `DetailSpecificationSection` sin glass/hover (jank). `App.jsx` toast → `bottom-center`. `DateForm.jsx` min con fecha local SV (UTC bloqueaba hoy).
- `services/reservationService.js`: `toBackendDate`, `getAvailability`, `calculateTotalPrice` con IVA (`{days,subtotal,iva,totalPrice}`), borrada cadena muerta `getToday*`.
- `FacturationDetail.jsx` + `ReservationPage.jsx`: flujo 1-clic con pasos Fechas→Resumen→Pagando, desglose IVA, `Pagar $XX con Wompi`, sin `alert()`, min local, redirección login con retorno.
- `ReservationPayment.jsx`: estados con icono + hora última verificación, caja error visible (roja si Wompi deshabilitado), ambos botones se bloquean cargando, texto honesto 90s. `MyReservationsPage.jsx`: `pt-24`.

## 8. Limpieza basura ejecutada
Borrados: `hooks/useDashboard.js`, `hooks/useCarTypes.js`, `lib/utils.js` (dup .ts), `components/common/NotFound.jsx`, deps `react-calendar`+`tree`, `useVehicleForm` params muertos, `vehicleService.getStatusLabel/Color`+`window.authToken`, cadena `getToday*`, `VehicleDragCard` muertos, `CreateVehicleForm` Microbus, backend Carvi completo + `/by-capacity|/available|/by-type` + `VehicleTypeDTO` + `findByCapacity/findAvailableBetween`. `npm install` pendiente para limpiar lock. Script `docs/migrations/20261007-clean-carvi.sql` (ejecutar con backup: borra features Carvi + tipo Microbus huérfano).

## 9. Docker local (2026-10-09)
`.env` creado (no existe en git) con passwords/JWT aleatorios. OJO: puerto 8080 ocupado por Sistema Windows (PID 4) → `BACKEND_PORT=18080` en `.env`. `docker compose up -d --build` OK: backend 34/34 tests, 3 servicios healthy. Links: frontend http://localhost:5173, backend http://localhost:18080/health UP. Datos prueba: admin `admin@example.com`/`AdminLocal2026!1`, cliente `cliente.prueba@example.com`/`Prueba2026!x`, 3 vehículos picsum, R1 Sedan 10-13nov $101.67, R2 SUV 1-5dic $225.95. Batería 12/12 OK (ver §2). Frontend proxy cachea GETs 60s (cambios admin tardan ≤60s en verse; `?nocache=1` lo bypasea).

## 10. Pendientes (no hacer sin orden explícita)
1. Textos T&C/Privacidad/Cookies/Aviso + footer + checkboxes (pedir razón social, NIT/NRC, contacto, dominio final, cancelación).
2. Cesión derechos equipo UCA + unificar marca + registro CNR + `elitedriver.sv`?.
3. Registro Defensoría e-commerce + libro reclamos + DTE Hacienda + reembolsos Wompi.
4. Contrato alquiler (licencia, km, combustible, entrega, multas, accidentes).
5. Refresh-token httpOnly + `npm install` + `React.lazy` + `?nocache` admin tras mutar + índices DB + Flyway (`ddl-auto:update→validate`).
6. Google Login (§4) y Wompi prod (§5) cuando lo pida.
7. `docs/WOMPI.md`, `DEPLOY-WOMPI-2026-09-17.md`, `PAYMENT-CONFIRMATION-2026-09-17.md` pueden estar desactualizados (precios sin IVA, Microbus, endpoints borrados).
