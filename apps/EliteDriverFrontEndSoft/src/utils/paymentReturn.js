const KEY = 'elitedriver.payment-return';
const MAX_AGE = 2 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function rememberPayment(reservationId, storage, now = Date.now()) {
    if (!UUID.test(reservationId)) return;
    try { storage.setItem(KEY, JSON.stringify({ reservationId, at: now })); } catch { /* La URL también identifica la reserva. */ }
}

export function returningReservation(search, storage, now = Date.now()) {
    const query = new URLSearchParams(search);
    const id = query.get('reservation');
    if (query.get('payment_return') === '1' && UUID.test(id)) return id;
    try {
        const saved = JSON.parse(storage.getItem(KEY));
        if (saved && UUID.test(saved.reservationId) && Number.isFinite(saved.at)
            && now >= saved.at && now - saved.at < MAX_AGE) return saved.reservationId;
    } catch { /* El almacenamiento puede estar deshabilitado. */ }
    return null;
}

export function forgetPayment(reservationId, storage) {
    try {
        const saved = JSON.parse(storage.getItem(KEY));
        if (saved?.reservationId === reservationId) storage.removeItem(KEY);
    } catch { /* No impedir la confirmación si el navegador bloquea el almacenamiento. */ }
}
