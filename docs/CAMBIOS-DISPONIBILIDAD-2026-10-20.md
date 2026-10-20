# Disponibilidad de vehículos sin mantenimiento — v1.3.0

Se retiraron la pantalla, el menú, las alertas, el historial y el cálculo de mantenimiento por kilometraje. Crear y editar vehículos ya no leen ni envían intervalos de mantenimiento. El kilometraje sigue siendo informativo.

Gestión de Vehículos permite activar/desactivar y programar varios períodos fuera de servicio (inicio y fin inclusivos). Se muestran estado para el rango consultado, reservas y bloqueos. No se pueden sobreescribir reservas ni bloquear dos veces las mismas fechas. Crear/renovar reservas y crear bloqueos validan el estado en servidor y comparten el bloqueo pesimista del vehículo. Solo administradores pueden modificar disponibilidad; el motivo interno no se entrega al público.

## Datos

La migración idempotente `db/vehicle-availability.sql` convierte `maintenanceCompleted` y `reserved` en `active`; los demás estados anteriores pasan a `outOfService`. Retira `maintenance_records` y `vehicles.km_for_maintenance`, conforme a la solicitud. No elimina vehículos, usuarios ni reservas. Se probó sobre una copia completa de la base y tras reiniciar, verificando contenido de vehículos y usuarios mediante huellas antes y después.

Para volver a una versión anterior hace falta restaurar conjuntamente la base respaldada y las imágenes anteriores: el código antiguo utiliza la tabla y columna retiradas. Los respaldos privados del servidor están fuera del repositorio.

## Versión y caché

La alerta mostrada por el usuario correspondía a frontend v1.2.5 en una pestaña abierta y backend v1.2.6. Se comprobó que el servidor ya servía ambas partes v1.2.6. El indicador nuevo vuelve a consultar al recuperar el foco, consulta cada minuto y ofrece **Recargar panel** si las versiones difieren. No recarga automáticamente formularios abiertos. Las respuestas de API y el documento principal evitan almacenamiento para que los cambios de disponibilidad no esperen una caché de un minuto.

## Validación

76 pruebas de backend, 54 de frontend y compilación de producción correctas. 31 comprobaciones de API en una copia aislada: permisos, alta sin mantenimiento, cambios de estado, rangos inválidos, límites inclusivos, superposiciones, retiro de bloqueo, tarifa con IVA incluido, retención de diez minutos, renovación y concurrencia real entre reserva y bloqueo. En esa carrera exactamente una operación fue aceptada y la otra rechazada. Revisión visual de dashboard, menú, controles y formularios. Las cuentas y el vehículo de prueba se retiraron y se verificó conservación exacta de los vehículos y usuarios originales.

El despliegue sigue siendo manual con `scripts/deploy.sh`, por decisión del usuario. GitHub ejecuta pruebas en main y publica imágenes al liberar un tag.
