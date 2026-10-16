-- Applied transactionally after Hibernate has created/updated the tables.
-- Serialize this idempotent change if several application instances start.
SELECT pg_advisory_xact_lock(1640162026);
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.reservations'::regclass
          AND conname = 'reservations_no_active_overlap'
    ) THEN
        -- Keep the existing inclusive return-day policy. NULL is legacy PENDING.
        -- PostgreSQL validates existing rows; conflicts must be resolved explicitly,
        -- never by deleting or silently cancelling a customer's reservation.
        ALTER TABLE public.reservations
            ADD CONSTRAINT reservations_no_active_overlap
            EXCLUDE USING gist (
                car_id WITH =,
                daterange(start_date::date, end_date::date, '[]') WITH &&
            ) WHERE (payment_status IS DISTINCT FROM 'CANCELLED');
    END IF;
END $$;
