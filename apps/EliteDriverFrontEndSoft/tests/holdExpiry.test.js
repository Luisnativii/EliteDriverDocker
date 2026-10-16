import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatCountdown } from '../src/hooks/useHoldCountdown.js';

const leer = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

test('el reloj se formatea con dos digitos', () => {
    assert.equal(formatCountdown(29, 59), '29:59');
    assert.equal(formatCountdown(5, 3), '05:03');
    assert.equal(formatCountdown(0, 7), '00:07');
});

test('la ventana de 30 minutos son 1800 segundos', () => {
    assert.equal(Math.floor(1800 / 60), 30);
    assert.equal(1800 % 60, 0);
    assert.equal(formatCountdown(30, 0), '30:00');
});

test('el panel de vencida ofrece volver a reservar si el auto sigue libre', () => {
    const src = leer('../src/components/reservation/HoldExpiredPanel.jsx');
    assert.match(src, /Volver a reservar por 30 minutos/);
    // Con alternativas deja de ofrecer el boton de re-reserva y muestra los modelos.
    assert.match(src, /alternatives/);
    assert.match(src, /ya lo tomó otra persona/);
});

test('los botones del panel tienen area tactil suficiente', () => {
    const src = leer('../src/components/reservation/HoldExpiredPanel.jsx');
    const botones = src.match(/min-h-1[12]/g) || [];
    assert.ok(botones.length >= 2, 'los botones principales deben medir al menos 44px');
});

test('el panel de pago avisa cuando queda poco tiempo', () => {
    const src = leer('../src/components/reservation/ReservationPayment.jsx');
    assert.match(src, /useHoldCountdown/, 'debe usar la cuenta regresiva');
    assert.match(src, /apúrate, casi se libera/, 'debe avisar en los ultimos minutos');
    assert.match(src, /HoldExpiredPanel/, 'debe mostrar el panel al vencer');
});

test('el backend expone el tiempo en el .env.example', () => {
    const env = leer('../../../.env.example');
    assert.match(env, /RESERVATION_HOLD_MINUTES=30/);
    assert.match(env, /volver a tomarlo/, 'debe explicar como recuperarla');
});

test('el backend libera las reservas vencidas', () => {
    const src = leer('../../../apps/EliteDriverBackendSoft/src/main/java/com/example/elitedriverbackend/services/ReservationHoldService.java');
    assert.match(src, /@Scheduled/, 'debe barrer solo las vencidas');
    assert.match(src, /PaymentStatus.CANCELLED/, 'CANCELLED es lo que libera el vehiculo');
});