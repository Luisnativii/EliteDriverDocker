CREATE INDEX IF NOT EXISTS idx_users_role_created ON users (role, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_user_payment ON reservations (user_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_supplier ON vehicles (supplier_id);
