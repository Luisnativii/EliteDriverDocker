import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goToReservation } from '../src/utils/reservationNavigation.js';

test('visitante desde portada o catálogo va al login con el vehículo como retorno', () => {
    for (const user of [null, undefined, { isAuthenticated: false }]) {
        const calls = [];
        goToReservation((...args) => calls.push(args), 'vehicle-123', user);
        assert.deepEqual(calls, [['/login', { state: { redirectTo:'/customer/reservation-page/vehicle-123' } }]]);
    }
});

test('cliente autenticado abre directamente la reserva del vehículo elegido', () => {
    const calls = [];
    goToReservation((...args) => calls.push(args), 'vehicle-123', { isAuthenticated: true });
    assert.deepEqual(calls, [['/customer/reservation-page/vehicle-123']]);
});
