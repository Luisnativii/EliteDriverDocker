import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rentalToday } from '../apps/EliteDriverFrontEndSoft/src/utils/rentalDates.js';

// Live integration tests against the local Docker stack. Never use production.
const [email, password] = process.argv.slice(2);
if (!email || !password) throw new Error('Pass the email and password of an existing local customer.');
const base = 'http://127.0.0.1:18080/api';
const created = new Set();
const checks = [];
const cleanup = [];
let headers;
let userId;
let vehicleId;
const request = async (route, { method = 'GET', body, authenticated = true } = {}) => {
    const start = performance.now();
    const response = await fetch(base + route, {
        method, headers: { 'Content-Type': 'application/json', ...(authenticated ? headers : {}) },
        ...(body && { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000),
    });
    const data = await response.json().catch(() => null);
    if (method === 'POST' && route === '/reservations' && response.status === 201) created.add(data.id);
    return { status: response.status, ms: Math.round(performance.now() - start), data };
};
const check = async (name, run) => {
    try {
        const observed = await run();
        checks.push({ name, passed: true, observed });
    } catch (error) {
        checks.push({ name, passed: false, error: error.message });
    }
};
const book = (startDate, endDate, id = vehicleId) => request('/reservations', {
    method: 'POST', body: { userId, vehicleId: id, startDate, endDate },
});
const cancel = async id => {
    const response = await request('/reservations/' + id, { method: 'DELETE' });
    assert.ok([200, 204].includes(response.status), `Cleanup returned ${response.status}`);
    created.delete(id);
    return response;
};
const apiDate = value => value.split('-').reverse().join('-');
const availability = (start, end) => request(`/reservations/availability?startDate=${apiDate(start)}&endDate=${apiDate(end)}`, { authenticated: false });

try {
    const login = await request('/auth/login', { method: 'POST', body: { email, password }, authenticated: false });
    assert.equal(login.status, 200, 'Local customer login must succeed');
    assert.equal(login.data.user.role, 'CUSTOMER', 'Use a local customer, not an administrator');
    headers = { Authorization: `Bearer ${login.data.token}` };
    userId = login.data.user.id;
    const fleet = await request('/vehicles');
    assert.equal(fleet.status, 200);
    const vehicle = fleet.data.find(v => v.name === 'Toyota Corolla 2022');
    assert.ok(vehicle, 'Expected local test Corolla');
    vehicleId = vehicle.id;
    const baseline = await book('2037-07-10', '2037-07-13');
    assert.equal(baseline.status, 201, 'Create isolated future test period');
    await check('Three days use the published server price with IVA included', async () => {
        assert.equal(baseline.data.totalPrice, Math.round(vehicle.pricePerDay * 3 * 100) / 100);
        assert.equal(baseline.data.paymentStatus, 'PENDING');
        return { total: baseline.data.totalPrice, status: baseline.data.paymentStatus };
    });
    for (const [name, start, end, occupied] of [
        ['Exact range', '2037-07-10', '2037-07-13', true],
        ['Interior range', '2037-07-11', '2037-07-12', true],
        ['Enclosing range', '2037-07-09', '2037-07-14', true],
        ['Partial overlap before', '2037-07-09', '2037-07-11', true],
        ['Partial overlap after', '2037-07-12', '2037-07-14', true],
        ['Inclusive return day', '2037-07-13', '2037-07-14', true],
        ['Inclusive pickup day', '2037-07-09', '2037-07-10', true],
        ['Following free day', '2037-07-14', '2037-07-15', false],
        ['Preceding free day', '2037-07-08', '2037-07-09', false],
    ]) {
        await check(`F02 availability: ${name}`, async () => {
            const response = await availability(start, end);
            assert.equal(response.status, 200);
            assert.equal(response.data.some(r => r.vehicleId === vehicleId), occupied);
            assert.ok(response.data.every(r => !('user' in r) && !('dui' in r) && !('email' in r)));
            return { status: response.status, occupied };
        });
        if (occupied) await check(`Creation agrees with availability: ${name}`, async () => {
            const response = await book(start, end);
            assert.equal(response.status, 400);
            assert.match(response.data.error, /ya está reservado/);
            return { status: response.status };
        });
    }
    await check('F05 server rejects a booking in 2001', async () => {
        const response = await book('2001-01-10', '2001-01-13');
        assert.equal(response.status, 400);
        assert.match(response.data.error, /anterior a hoy/);
        return { status: response.status, error: response.data.error };
    });
    await check('F04 server accepts today in the business timezone', async () => {
        const today = rentalToday();
        const tomorrow = new Date(`${today}T00:00:00Z`);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const response = await book(today, tomorrow.toISOString().slice(0, 10));
        assert.equal(response.status, 201);
        await cancel(response.data.id);
        return { startDate: today, status: response.status };
    });
    for (const [name, start, end] of [
        ['zero days', '2037-08-10', '2037-08-10'], ['reversed', '2037-08-13', '2037-08-10'],
    ]) await check(`Invalid duration: ${name}`, async () => {
        const response = await book(start, end);
        assert.equal(response.status, 400);
        return { status: response.status };
    });
    for (let round = 1; round <= 5; round++) await check(`F01 concurrent round ${round}: one accepted of five`, async () => {
        // All five requests start before awaiting any result.
        const attempts = await Promise.all(Array.from({ length: 5 }, () => book(`2037-08-${10 + round * 3}`, `2037-08-${12 + round * 3}`)));
        assert.equal(attempts.filter(r => r.status === 201).length, 1);
        assert.equal(attempts.filter(r => r.status === 400).length, 4);
        assert.ok(attempts.filter(r => r.status === 400).every(r => /ya está reservado/.test(r.data.error)));
        return { accepted: 1, rejected: 4, statuses: attempts.map(r => r.status) };
    });
    await check('Disjoint concurrent ranges for the same vehicle both succeed', async () => {
        const attempts = await Promise.all([book('2037-09-10', '2037-09-12'), book('2037-09-14', '2037-09-16')]);
        assert.deepEqual(attempts.map(r => r.status), [201, 201]);
        return { statuses: attempts.map(r => r.status) };
    });
    await check('Different vehicles can be reserved for the same dates', async () => {
        const other = fleet.data.find(v => v.id !== vehicleId);
        assert.ok(other);
        const attempts = await Promise.all([book('2037-10-10', '2037-10-13'), book('2037-10-10', '2037-10-13', other.id)]);
        assert.deepEqual(attempts.map(r => r.status), [201, 201]);
        return { statuses: attempts.map(r => r.status) };
    });
    await check('Cancellation releases availability and permits booking again', async () => {
        await cancel(baseline.data.id);
        const free = await availability('2037-07-11', '2037-07-12');
        assert.equal(free.status, 200);
        assert.equal(free.data.some(r => r.vehicleId === vehicleId), false);
        const replacement = await book('2037-07-11', '2037-07-12');
        assert.equal(replacement.status, 201);
        return { availableAfterCancel: true, replacementStatus: replacement.status };
    });
} catch (error) {
    checks.push({ name: 'Integration prerequisites and execution', passed: false, error: error.message });
} finally {
    for (const id of [...created]) {
        try { const response = await cancel(id); cleanup.push({ status: response.status }); }
        catch (error) { cleanup.push({ error: error.message }); }
    }
    const report = { timestamp: new Date().toISOString(), checks, cleanup,
        passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length,
        uncleanedReservations: created.size };
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    fs.writeFileSync(path.join(root, 'docs/VERIFICACION-F01-F05-2026-10-16.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (report.failed || created.size) process.exitCode = 1;
}
