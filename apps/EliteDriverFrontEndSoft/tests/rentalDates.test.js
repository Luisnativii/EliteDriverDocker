import { test } from 'node:test';
import assert from 'node:assert/strict';
import ReservationService from '../src/services/reservationService.js';
import { rentalToday, isRentalDate, rentalDays } from '../src/utils/rentalDates.js';

const reservation = { vehicleId: 'test-vehicle', startDate: '2026-10-16', endDate: '2026-10-17' };

test('hoy sigue siendo válido después de las 18:00 y hasta medianoche del negocio', () => {
    for (const instant of ['2026-10-17T00:00:00Z', '2026-10-17T01:00:00Z', '2026-10-17T05:59:59Z']) {
        const now = new Date(instant);
        assert.equal(rentalToday(now), '2026-10-16');
        assert.equal(ReservationService.validateReservation(reservation, now).isValid, true);
    }
});

test('al cambiar el día local, ayer deja de ser válido y hoy sigue permitido', () => {
    const now = new Date('2026-10-17T06:00:00Z');
    assert.equal(rentalToday(now), '2026-10-17');
    assert.equal(ReservationService.validateReservation(reservation, now).isValid, false);
    assert.equal(ReservationService.validateReservation({ ...reservation, startDate: '2026-10-17', endDate: '2026-10-18' }, now).isValid, true);
});

test('fechas imposibles, incompletas o con hora devuelven errores sin lanzar excepciones', () => {
    for (const value of ['invalid-date', '2026-02-30', '2027-02-29', '2026-1-01', '2026-10-16T12:00:00Z', '0000-01-01']) {
        assert.equal(isRentalDate(value), false);
        assert.equal(ReservationService.validateReservation({ ...reservation, startDate: value }).isValid, false);
        assert.equal(rentalDays(value, '2026-11-01'), 0);
    }
});

test('duración de calendario e IVA se conservan en cambios de mes, año y bisiesto', () => {
    for (const [start, end, days] of [
        ['2026-11-20', '2026-11-23', 3], ['2026-10-31', '2026-11-01', 1],
        ['2026-12-31', '2027-01-01', 1], ['2028-02-28', '2028-03-01', 2],
    ]) {
        assert.equal(rentalDays(start, end), days);
    }
    assert.deepEqual(ReservationService.calculateTotalPrice('2026-11-20', '2026-11-23', 29.99),
        { days: 3, subtotal: 89.97, iva: 11.70, totalPrice: 101.67 });
});

test('mismo día, rango invertido y fechas ausentes no son reservas válidas', () => {
    const now = new Date('2026-10-16T15:00:00Z');
    for (const [startDate, endDate] of [['2026-11-20', '2026-11-20'], ['2026-11-23', '2026-11-20'], ['', ''], [null, null]]) {
        assert.equal(ReservationService.validateReservation({ vehicleId:'vehicle', startDate, endDate }, now).isValid, false);
        assert.equal(ReservationService.calculateTotalPrice(startDate, endDate, 29.99).days, 0);
    }
});
