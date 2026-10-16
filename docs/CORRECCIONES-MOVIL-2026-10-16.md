# Correcciones del flujo y uso móvil: F06–F24

Fecha: 16 de octubre de 2026. Cambios aplicados al código y a la imagen frontend local de Docker. Aplicación: http://localhost:5173.

| Hallazgos | Corrección |
|---|---|
| F06 | El error al crear el enlace de pago se conserva al consultar el estado. Un enlace fallido no inicia seguimiento repetido; los botones permiten reintentar. |
| F07 | Login y registro conservan el vehículo solicitado y regresan a su reserva después del acceso automático. |
| F08, F10 | Rango válido persistido en la sesión del navegador; se restaura al recargar. Cambiar el inicio limpia una devolución incompatible. Búsqueda y reserva bloquean rangos incompletos o inválidos y explican cómo corregirlos. |
| F09 | Error junto a la acción de reservar, anunciado como alerta, con foco y desplazamiento al mensaje. Se limpia al cambiar fechas. |
| F11–F14, F18 | Portada con espacio para el encabezado y tipografía adaptable; formulario apilado antes; pasos de reserva sin desbordamiento; encabezado opaco; acciones administrativas apiladas en teléfono. |
| F15 | Selector de estado de mantenimiento utilizable con toque y teclado. Comparte las validaciones y la confirmación de cambios críticos del flujo existente. |
| F16–F17 | Ocho etiquetas de registro asociadas con sus campos y errores. Menú móvil y formulario de vehículo gestionan foco, Escape y retorno al control de apertura; formulario expuesto como diálogo. |
| F19 | Páginas cargadas bajo demanda con React.lazy y Suspense. Paquete principal de JavaScript: 750,35 → 283,30 kB; gzip: 219,75 → 89,69 kB. Existen paquetes compartidos y de rutas adicionales; estas cifras no representan toda la transferencia de la página ni una medición de velocidad celular. |
| F20–F23 | Flechas de galerías de al menos 44 px con nombres descriptivos; progreso derivado de fechas y carga; nombres de vehículo sin marca duplicada; precios administrativos con dos decimales; documento en español. |
| F24 | Cubierto por la corrección previa de fechas: las entradas malformadas devuelven errores sin lanzar Invalid time value. |

## Verificación

- 41 pruebas automatizadas de frontend aprobadas, incluidas persistencia, rangos incompatibles, almacenamiento dañado y fechas inválidas. Compilación de producción y reconstrucción Docker correctas.
- Comprobación en navegador Chromium a 320×568: portada, reserva, mantenimiento y gestión de vehículos con ancho de contenido 310 px y sin desbordamiento horizontal de main. Portada a 1024 px: contenido y área útil de 758 px.
- Registro completo desde un vehículo: vuelve a la reserva del Corolla con las fechas 20–23 de noviembre de 2026, incluso tras recargar. Los ocho campos tienen etiqueta asociada.
- Error real HTTP 503 de Wompi: alerta de reserva visible dentro de la pantalla y con foco. En Mis reservas el error permanece tras consultar PENDING y los botones de pago y verificación se recuperan.
- Menú móvil cierra con Escape. Agregar vehículo abre con foco en Cerrar, expone role=dialog, cierra con Escape y devuelve el foco a Agregar Vehículo.
- Selector de mantenimiento de 44 px: elegir Fuera de servicio abre la confirmación; se canceló con Escape sin modificar el estado del vehículo.
- Se canceló la reserva creada para esta prueba y se eliminó únicamente su usuario sintético. Se conservaron los 3 vehículos y las 2 reservas originales. Los tres servicios Docker quedaron saludables.

Las pruebas fueron en navegador con tamaños simulados, sin teléfono físico ni Safari. Wompi está deshabilitado en este entorno: se comprobó el manejo del fallo y la recuperación, sin realizar un cobro real. Las 50 pruebas de backend y las verificaciones de integridad de F01–F05 corresponden a la entrega previa; este bloque no modifica el backend.

## Evidencias

- [Portada 320 px](correcciones-movil-2026-10-16/inicio-320.jpg)
- [Portada 1024 px](correcciones-movil-2026-10-16/inicio-1024.jpg)
- [Reserva 320 px](correcciones-movil-2026-10-16/reserva-320.jpg)
- [Error visible junto a la reserva](correcciones-movil-2026-10-16/error-reserva-visible-320.jpg)
- [Error de pago persistente](correcciones-movil-2026-10-16/error-pago-persistente-320.jpg)
- [Mantenimiento](correcciones-movil-2026-10-16/mantenimiento-320.jpg)
- [Diálogo de vehículo](correcciones-movil-2026-10-16/dialogo-vehiculo-320.jpg)

La [auditoría original](AUDITORIA-MOVIL-2026-10-16.md) conserva las evidencias anteriores a las correcciones.
