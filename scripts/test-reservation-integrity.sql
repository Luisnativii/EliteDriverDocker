-- Run against local PostgreSQL with psql -v ON_ERROR_STOP=1.
-- Every insert is rolled back, including successful CANCELLED/disjoint cases.
BEGIN;
DO $$
DECLARE
    vehicle uuid;
    customer uuid;
    cancelled_id uuid := gen_random_uuid();
    failures integer := 0;
    state text;
BEGIN
    SELECT id INTO STRICT vehicle FROM vehicles WHERE name = 'Toyota Corolla 2022';
    SELECT id INTO STRICT customer FROM users WHERE email = 'cliente.prueba@example.com';

    INSERT INTO reservations (id, car_id, user_id, start_date, end_date, payment_status, total_price)
    VALUES (gen_random_uuid(), vehicle, customer, '2040-01-10', '2040-01-13', 'PENDING', 101.67);

    -- A bypass of the application still cannot overlap any holding status.
    FOREACH state IN ARRAY ARRAY['PENDING', 'PAID', 'PAID_TEST', NULL::text] LOOP
        BEGIN
            INSERT INTO reservations (id, car_id, user_id, start_date, end_date, payment_status, total_price)
            VALUES (gen_random_uuid(), vehicle, customer, '2040-01-11', '2040-01-12', state, 33.89);
            RAISE EXCEPTION 'Overlap was incorrectly accepted for status %', state;
        EXCEPTION WHEN exclusion_violation THEN
            failures := failures + 1;
        END;
    END LOOP;

    -- A cancelled booking may overlap and does not retain inventory.
    INSERT INTO reservations (id, car_id, user_id, start_date, end_date, payment_status, total_price)
    VALUES (cancelled_id, vehicle, customer, '2040-01-11', '2040-01-12', 'CANCELLED', 33.89);
    BEGIN
        UPDATE reservations SET payment_status = 'PENDING' WHERE id = cancelled_id;
        RAISE EXCEPTION 'Reactivation of an overlapping cancelled booking was incorrectly accepted';
    EXCEPTION WHEN exclusion_violation THEN
        failures := failures + 1;
    END;

    -- The return day remains occupied, as it was before these fixes.
    BEGIN
        INSERT INTO reservations (id, car_id, user_id, start_date, end_date, payment_status, total_price)
        VALUES (gen_random_uuid(), vehicle, customer, '2040-01-13', '2040-01-14', 'PENDING', 33.89);
        RAISE EXCEPTION 'Inclusive return day was incorrectly accepted';
    EXCEPTION WHEN exclusion_violation THEN
        failures := failures + 1;
    END;

    INSERT INTO reservations (id, car_id, user_id, start_date, end_date, payment_status, total_price)
    VALUES (gen_random_uuid(), vehicle, customer, '2040-01-14', '2040-01-15', 'PENDING', 33.89);
    IF failures <> 6 THEN RAISE EXCEPTION 'Expected 6 rejected conflicts, got %', failures; END IF;
    RAISE NOTICE 'PASS: 6 conflicts rejected; cancelled and disjoint bookings accepted.';
END $$;
ROLLBACK;
