import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reservationStatus, reservationStats, localReservationDate, holdsReservationDates } from '../src/utils/reservationStatus.js';
import { returningReservation, rememberPayment, forgetPayment } from '../src/utils/paymentReturn.js';

const today = new Date('2026-09-17T12:00:00');
const reservation = { startDate: '2026-09-17T00:00:00.000+00:00', endDate: '2026-09-17', totalPrice: 59.97 };
const id = '6f3a8574-2db3-4fa9-a73d-c0022f7a31d0';
const storage = () => {
    const values = new Map();
    return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
};

test('una reserva sin pago nunca está activa aunque sus fechas coincidan', () => {
    for (const paymentStatus of [undefined, null, 'PENDING', 'APPROVED', 'success']) {
        assert.equal(reservationStatus({ ...reservation, paymentStatus }, today), 'pendiente');
    }
});
test('pruebas y cancelaciones tienen su propio estado', () => {
    assert.equal(reservationStatus({ ...reservation, paymentStatus: 'PAID_TEST' }, today), 'prueba');
    assert.equal(reservationStatus({ ...reservation, paymentStatus: 'CANCELLED' }, today), 'cancelada');
});
test('las solicitudes pendientes retienen fechas sin contar como activas ni ingresos', () => {
    for (const paymentStatus of ['PENDING', 'PAID', 'PAID_TEST', null]) {
        assert.equal(holdsReservationDates({ paymentStatus }), true);
    }
    assert.equal(holdsReservationDates({ paymentStatus: 'CANCELLED' }), false);
    const pending = { ...reservation, paymentStatus: 'PENDING' };
    assert.equal(reservationStatus(pending, today), 'pendiente');
    assert.equal(reservationStats([pending], today).totalRevenue, 0);
});
test('la reserva pagada conserva todo el último día en la zona local', () => {
    const paid = { ...reservation, paymentStatus: 'PAID' };
    assert.equal(reservationStatus(paid, new Date('2026-09-17T23:59:59.999')), 'activa');
    assert.equal(reservationStatus(paid, new Date('2026-09-18T00:00:00')), 'completada');
    assert.equal(reservationStatus(paid, new Date('2026-09-16T23:59:59')), 'próxima');
    assert.equal(localReservationDate(reservation.startDate).getDate(), 17);
});
test('solo los pagos reales cuentan como reservas confirmadas e ingresos', () => {
    const rows = ['PAID', 'PENDING', 'PAID_TEST', 'CANCELLED', null].map(paymentStatus => ({ ...reservation, paymentStatus }));
    assert.deepEqual(reservationStats(rows, today), { total: 1, registered: 5, pending: 2, test: 1,
        active: 1, upcoming: 0, completed: 0, totalRevenue: 59.97 });
});
test('el retorno identifica una reserva para consultar, sin interpretar un supuesto resultado de pago', () => {
    assert.equal(returningReservation(`?reservation=${id}&payment_return=1&status=PAID`, storage()), id);
    assert.equal(returningReservation('?payment_return=1&status=PAID&reservation=invalid', storage()), null);
});
test('los enlaces anteriores se verifican al regresar y el recuerdo caduca', () => {
    const store = storage();
    rememberPayment(id, store, 1000);
    assert.equal(returningReservation('', store, 2000), id);
    assert.equal(returningReservation('', store, 1000 + 2 * 60 * 60 * 1000), null);
    forgetPayment(id, store);
    assert.equal(returningReservation('', store, 2000), null);
});
