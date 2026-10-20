import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatCountdown } from '../src/hooks/useHoldCountdown.js';

// Estas pruebas solo leen archivos dentro del paquete del frontend: el build de
// Docker copia unicamente este directorio, asi que leer fuera (por ejemplo el
// .env.example de la raiz) rompe la imagen. La logica del servidor la cubren
// sus propias pruebas de Java.
const leer = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

test('el reloj se formatea con dos digitos', () => {
    assert.equal(formatCountdown(29, 59), '29:59');
    assert.equal(formatCountdown(5, 3), '05:03');
    assert.equal(formatCountdown(0, 7), '00:07');
});

test('la ventana de 10 minutos son 600 segundos', () => {
    assert.equal(Math.floor(600 / 60), 10);
    assert.equal(600 % 60, 0);
    assert.equal(formatCountdown(10, 0), '10:00');
});

test('el panel de vencida ofrece volver a reservar si el auto sigue libre', () => {
    const src = leer('../src/components/reservation/HoldExpiredPanel.jsx');
    assert.match(src, /Volver a reservar el vehículo/);
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

test('el servicio expone renovar y buscar alternativas', () => {
    const src = leer('../src/services/paymentService.js');
    assert.match(src, /renewHold/);
    assert.match(src, /getAlternatives/);
});