# Administración de proveedores y clientes — v1.3.1

## Comportamiento

- Proveedores: crear, editar, buscar y eliminar proveedores sin vehículos asignados. Datos opcionales: teléfono, correo y notas. El listado muestra cuántos vehículos tiene cada proveedor y permite abrirlos en Gestión de Vehículos.
- Propiedad: proveedor opcional al crear/editar un vehículo; sin selección se considera propio. Cambiar otros campos mediante la API conserva la asignación; enviar `supplierId: null` la elimina. Los filtros de propiedad, tipo, fechas y estado se combinan.
- Clientes: lista paginada y búsqueda por nombre, correo, teléfono o DUI, exclusiva para cuentas CUSTOMER. Creación y último acceso en horario de El Salvador. Cada cliente abre su historial completo y paginado.
- Prioridad: alquileres reales pagados activos hoy; luego reservas pendientes con retención vigente y contador; después las demás cuentas. Los pendientes vencidos se cancelan mediante el mecanismo existente. Se actualiza al vencer el contador, cada 15 segundos y al volver a la ventana.
- Meses: abre el mes actual, permite retroceder, seleccionar un mes anterior y regresar al actual. No permite meses futuros.
- Cifras: nuevos clientes según su fecha de registro; clientes distintos con al menos un alquiler real confirmado que coincida con el mes; cantidad de esos alquileres. Un alquiler que cruza meses cuenta en cada mes ocupado; los días extremos son inclusivos. Los pagos de prueba se conservan en el historial y se excluyen de esas cifras. Las tarjetas de actividad y pendientes muestran el estado actual, independientemente del mes.
- Los importes siguen incluyendo IVA y la retención de pago sigue siendo de 10 minutos. Se conservan los estados Activo/Inactivo y los períodos fuera de servicio.

## Datos y permisos

Se agregan la tabla `suppliers`, la relación nullable `vehicles.supplier_id`, las fechas nullable `users.created_at` y `users.last_login_at` e índices de consulta. No se borran ni recrean vehículos, usuarios o reservas. Los vehículos existentes quedan como propios.

Las fechas históricas desconocidas permanecen vacías y se muestran como “No registrado”; no se inventan fechas de registro ni de acceso. Los registros nuevos guardan ambos momentos porque el registro también abre sesión. Solo un inicio de sesión exitoso actualiza el último acceso.

Todos los endpoints `/api/admin/**` requieren ADMIN. Las respuestas públicas o de clientes sobre vehículos omiten la identidad del proveedor. Los DTO de clientes no contienen contraseñas, tokens, enlaces de pago ni identificadores privados de Wompi. El borrado de proveedores y la asignación de vehículos usan bloqueo de fila para impedir referencias inválidas concurrentes.

## Verificación

- 86 pruebas backend, 60 frontend y compilación frontend correctas.
- Candidato Docker construido con una copia de la base de datos del servidor.
- 49 comprobaciones API del nuevo módulo y 33 de regresión de disponibilidad/reservas, incluida concurrencia entre reserva y bloqueo.
- Revisión visual: creación de proveedor y vehículo asociado, filtros combinados, clientes por prioridad con contador, cambio de mes e historial completo.
- Limpieza de todos los registros temporales: 11 usuarios y 12 vehículos originales conservados, con comparación de huellas de sus datos.
- Sin cobros externos durante las pruebas. Los estados pagados de las pruebas se simularon exclusivamente en reservas temporales.

[Resultados estructurados](VERIFICACION-PROVEEDORES-CLIENTES-2026-10-20.json).

## Publicación

Tag `v1.3.1`, despliegue manual con `scripts/deploy.sh v1.3.1`. La versión se aplica a frontend y backend para evitar la alerta de versiones distintas. GitHub Actions ejecuta pruebas en main y publica imágenes en el tag; el servidor se actualiza con el proceso manual existente.
