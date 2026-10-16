#!/usr/bin/env bash
#
# Re-arma las pre-reservas pendientes que se ven en el panel de administración.
#
# Por qué existe: una reserva sin pagar libera el vehículo a los 30 minutos
# (app.reservation.hold-minutes). Es lo correcto, pero deja el panel vacío si
# nadie ha reservado nada. Ejecuta esto antes de mostrar la aplicación.
#
#   ./scripts/demo-pendientes.sh              # en el servidor
#   ssh serverln@homelab.local 'bash /path/demo-pendientes.sh'
#
# No toca los vehículos, ni las reservas confirmadas, ni la que el cliente
# pagó por Wompi.

set -euo pipefail
cd "$(dirname "$0")/.."

echo "== rearmando pre-reservas pendientes =="

docker compose exec -T postgres psql -U elitedriver -d elitedriver -v ON_ERROR_STOP=1 <<'SQL'
\pset pager off

BEGIN;

-- 1) limpiar las anteriores de esta misma lista, en cualquier estado salvo
--    la que se pagó de verdad. Los vehículos quedan libres.
DELETE FROM reservations r
 USING vehicles v
 WHERE r.car_id = v.id
   AND r.wompi_link_id IS NULL
   AND r.payment_transaction_id IS NULL
   AND v.name IN ('Kia Forte 2018', 'Kia Soul 2021', 'Nissan Rogue 4x4 2019', 'Nissan Rogue Sport 2019')
   AND r.start_date::date IN (DATE '2026-11-08', DATE '2026-11-26', DATE '2026-12-05', DATE '2026-12-10');

-- 2) cuatro pendientes con vencimientos escalonados, para que se vea el
--    contador retrocediendo en cada una
INSERT INTO reservations (id, start_date, end_date, user_id, car_id, total_price,
       payment_status, payment_production, hold_expires_at)
SELECT gen_random_uuid(), d.desde, d.hasta, u.id, v.id, d.monto, 'PENDING', false,
       now() + make_interval(mins => d.minutos)
  FROM (VALUES
    ('Kia Soul 2021',       DATE '2026-11-08', DATE '2026-11-11', 27.00, 21),
    ('Nissan Rogue Sport 2019', DATE '2026-11-26', DATE '2026-11-29', 37.80, 14),
    ('Nissan Rogue 4x4 2019',    DATE '2026-12-05', DATE '2026-12-08', 27.00, 8),
    ('Kia Forte 2018',          DATE '2026-12-10', DATE '2026-12-13', 20.40, 3)
  ) AS d(auto, desde, hasta, monto, minutos)
  JOIN vehicles v  ON v.name = d.auto
  JOIN users u    ON u.email = 'mauricio.calles@outlook.com';

COMMIT;

SELECT v.name AS auto, r.start_date::date AS desde, r.end_date::date AS hasta,
       r.total_price, r.payment_status AS estado,
       to_char(r.hold_expires_at, 'HH24:MI:SS') AS vence
  FROM reservations r JOIN vehicles v ON v.id = r.car_id
 WHERE r.payment_status = 'PENDING'
 ORDER BY r.hold_expires_at;
SQL

echo "== listo =="