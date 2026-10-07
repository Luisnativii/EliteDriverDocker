-- Limpieza Carvi (negocio confirma: Carvi no volverá)
-- Ejecutar en homelab con backup previo. Tablas reales: vehicle_features(feature, vehicle_id), vehicle_type(type).
-- 1) Ver qué hay antes de borrar:
-- SELECT feature, COUNT(*) FROM vehicle_features WHERE feature LIKE '%Fuente Carvi ID:%' GROUP BY feature LIMIT 20;
-- SELECT type FROM vehicle_type;

-- 2) Borrar solo features trazadoras de Carvi (no toca Año/Placa/Transmisión útiles si las quieres conservar,
--    pero borra el ID que ata al sistema viejo):
DELETE FROM vehicle_features WHERE feature LIKE 'Fuente Carvi ID:%';
DELETE FROM vehicle_features WHERE feature LIKE 'Estado origen:%';
DELETE FROM vehicle_features WHERE feature LIKE 'Tipo original:%';
DELETE FROM vehicle_features WHERE feature LIKE 'Partner:%';

-- 3) Quitar tipo Microbus si quedó huérfano (DataInitializer ya no lo siembra):
-- Solo si COUNT = 0:
-- SELECT COUNT(*) FROM vehicles v JOIN vehicle_type t ON v.vehicle_type_id = t.id WHERE t.type = 'Microbus';
-- DELETE FROM vehicle_type WHERE type = 'Microbus';
