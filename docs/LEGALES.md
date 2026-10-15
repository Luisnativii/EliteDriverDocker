# Documentos legales del sitio

Los cuatro documentos son públicos: se leen en `/informacion/...` sin cuenta ni
sesión. Eso no es una preferencia, lo exige el **artículo 16(g)** de la Ley para
la Protección de Datos Personales (Decreto Legislativo N.° 144): el aviso de
privacidad debe estar publicado en el sitio web del responsable.

## Fuentes legales usadas

| Fuente | Qué obliga |
| --- | --- |
| Ley para la Protección de Datos Personales, Decreto Legislativo N.° 144 (nov 2024) | Registro del banco de datos ante la ACE, aviso de privacidad en el sitio, derechos ARCO-POL, notificación de brechas en 72 horas. |
| Ley de Protección al Consumidor, art. 21-A | Registro Único de Proveedores de Bienes y Servicios en Comercio Electrónico (gratuito, en línea). |

El artículo 7 de la primera ley fija los cinco puntos que el aviso debe informar.
El test `documentosLegales.test.js` verifica que sigan presentes.

## Antes de publicar: completar los PENDIENTE

Ningún documento sale con datos inventados. Lo que falta depende de inscripciones
que hace el negocio:

```bash
grep -rn "PENDIENTE" apps/EliteDriverFrontEndSoft/src/
```

Campos que bloquean la publicación:

- `razonSocial`, `nit`, `nrc` — aparecen en el pie de cada documento.
- `domicilio`, `telefono`, `email` — contacto del responsable (Art. 7 literal c).
- `responsableTratamiento`, `correoPrivacidad` — a quién escribir para ejercer derechos.
- `registroComercioElectronico` — número del registro ante la Defensoría del Consumidor.
- `registroACE` — inscripción del banco de datos ante la Agencia de Ciberseguridad.

Además, en los Términos hay tres bloques marcados que son decisiones del
negocio, no datos registrales: **depósito y garantía**, **entrega y devolución**
(lugar, horario, combustible, kilometraje, accidentes) y **cancelaciones**
(plazo sin costo, penalidad, reembolsos).

Todo eso se edita en un solo archivo:
`apps/EliteDriverFrontEndSoft/src/config/businessInfo.js`

## Trámites que dependen del negocio

1. **Registro ante la Defensoría del Consumidor** — gratuito, en línea:
   <https://www.defensoria.gob.sv/registrocomercioelectronico/>
2. **Registro del banco de datos ante la ACE** — Agencia de Ciberseguridad del Estado.
3. **Facturación (DTE)** ante el Ministerio de Hacienda.

## Recomendación

Estos textos cubren lo que la ley exige y reflejan cómo funciona el negocio hoy
(precios con IVA, pago por Wompi, reserva confirmada solo con pago aprobado).
No sustituyen una revisión jurídica: antes de abrir al público conviene que un
abogado revise los bloques de depósito, entrega y cancelaciones, que son los que
generan obligaciones concretas con el cliente.