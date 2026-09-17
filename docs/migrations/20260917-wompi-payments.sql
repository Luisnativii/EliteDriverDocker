-- Wompi: únicamente agrega campos opcionales e índices de unicidad.
-- Conserva las filas, fechas, usuarios y vehículos existentes.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

ALTER TABLE public."reservations"
    ADD COLUMN IF NOT EXISTS "total_price" numeric(12,2),
    ADD COLUMN IF NOT EXISTS "payment_status" varchar(255)
        CHECK ("payment_status" IN ('PENDING', 'PAID', 'PAID_TEST', 'CANCELLED')),
    ADD COLUMN IF NOT EXISTS "wompi_link_id" bigint,
    ADD COLUMN IF NOT EXISTS "wompi_application_id" varchar(255),
    ADD COLUMN IF NOT EXISTS "payment_url" varchar(2000),
    ADD COLUMN IF NOT EXISTS "qr_code_url" varchar(2000),
    ADD COLUMN IF NOT EXISTS "payment_production" boolean,
    ADD COLUMN IF NOT EXISTS "payment_transaction_id" varchar(255),
    ADD COLUMN IF NOT EXISTS "paid_at" timestamp(6) with time zone;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.reservations'::regclass
          AND conname = 'uk_reservations_wompi_link'
    ) THEN
        ALTER TABLE public."reservations" ADD CONSTRAINT "uk_reservations_wompi_link"
            UNIQUE ("wompi_link_id");
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.reservations'::regclass
          AND conname = 'uk_reservations_payment_transaction'
    ) THEN
        ALTER TABLE public."reservations" ADD CONSTRAINT "uk_reservations_payment_transaction"
            UNIQUE ("payment_transaction_id");
    END IF;
END
$$;
COMMIT;
