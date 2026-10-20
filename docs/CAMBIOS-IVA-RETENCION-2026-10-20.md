# IVA incluido y retención de 10 minutos — 20 de octubre de 2026

## Comportamiento

- La tarifa publicada del vehículo ya incluye IVA. El total de las reservas nuevas es días × tarifa diaria, sin sumar 13 % adicional.
- Ejemplo: $29.99 × 3 días = $89.97. Backend, catálogo, portada, resumen y Wompi usan ese importe.
- El catálogo, el detalle, Mis reservas, el pago y las alternativas indican IVA incluido. Los formularios administrativos aclaran que la tarifa se ingresa con IVA.
- Términos e Información legal explican que no se añade IVA. Se corrigió también la afirmación de que un vehículo pendiente seguía disponible: se retiene durante 10 minutos.
- `RESERVATION_HOLD_MINUTES` pasa a 10 en Java, Spring, Compose y el ejemplo de entorno. El `.env` privado debe configurarse también en 10.
- El contador usa el vencimiento real del servidor. Al llegar exactamente al vencimiento la reserva pendiente ya es liberable. Renovar concede una nueva ventana si el auto sigue libre.
- Las reservas anteriores conservan su total y su vencimiento guardados; no se modifican importes pactados ni pagos existentes.

## Validación previa al despliegue

- Frontend: 51 pruebas correctas y compilación de producción correcta.
- Backend: 67 pruebas correctas, incluidos precio final, monto enviado a Wompi, conservación del importe guardado, plazo predeterminado de 10 minutos y vencimiento exacto.
- Se actualizaron los scripts de verificación de precios. Los informes de auditorías anteriores se conservan como evidencia histórica; sus importes corresponden a la regla anterior.

## Flujo de publicación

El workflow de GitHub ejecuta pruebas al actualizar `main` y construye/publica imágenes con etiquetas `v*`. No despliega al homelab. Por decisión del usuario, esta entrega utiliza el script manual existente, `scripts/deploy.sh`; no instala un runner ni modifica el CI/CD.

El trabajo de esta entrega se aisló desde `origin/main` para no publicar tres commits locales previos ajenos a la solicitud. Antes de desplegar deben respaldarse la configuración privada, la base y el archivo remoto no versionado `scripts/demo-pendientes.sh`.

## Textos legales revisados

Se revisaron los documentos públicos respecto de precios, IVA y retención. Privacidad y cookies no contenían otra regla de IVA que corregir. Permanecen los datos registrales y políticas comerciales que ya estaban marcados `PENDIENTE` (identidad y registros del negocio, depósito, entrega y cancelación); esta entrega no inventa esos datos ni constituye una revisión jurídica integral.
