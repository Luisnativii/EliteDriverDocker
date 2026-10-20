DO $$
DECLARE c record;
BEGIN
    FOR c IN SELECT conname FROM pg_constraint WHERE conrelid = 'vehicles'::regclass
        AND contype = 'c' AND pg_get_constraintdef(oid) ~ '\mstatus\M'
    LOOP EXECUTE format('ALTER TABLE vehicles DROP CONSTRAINT %I', c.conname); END LOOP;
    UPDATE vehicles SET status = CASE WHEN status IN ('maintenanceCompleted', 'reserved', 'active') THEN 'active' ELSE 'outOfService' END
        WHERE status NOT IN ('active', 'outOfService');
    ALTER TABLE vehicles ADD CONSTRAINT vehicles_status_check CHECK (status IN ('active', 'outOfService'));
END $$;
DROP TABLE IF EXISTS maintenance_records;
ALTER TABLE vehicles DROP COLUMN IF EXISTS km_for_maintenance;
