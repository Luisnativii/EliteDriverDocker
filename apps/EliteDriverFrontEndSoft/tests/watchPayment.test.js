import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchPayment } from '../src/utils/watchPayment.js';

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
function scheduler() {
    const tasks = new Map();
    let next = 0;
    return { tasks, schedule: (fn, delay) => { tasks.set(++next, { fn, delay }); return next; },
        unschedule: id => tasks.delete(id), run: () => { const [id, task] = tasks.entries().next().value; tasks.delete(id); task.fn(); } };
}
test('consulta hasta aprobación y detiene todas las consultas posteriores', async () => {
    const clock = scheduler();
    let reads = 0;
    const updates = [];
    const checking = [];
    const watcher = watchPayment({ ...clock, repeat: true, read: async () => ({ paymentStatus: ++reads < 3 ? 'PENDING' : 'PAID_TEST' }),
        onUpdate: p => updates.push(p.paymentStatus), onError: assert.fail, onChecking: c => checking.push(c) });
    await flush(); clock.run(); await flush(); clock.run(); await flush();
    assert.deepEqual(updates, ['PENDING', 'PENDING', 'PAID_TEST']);
    assert.equal(clock.tasks.size, 0);
    assert.equal(checking.at(-1), false);
    await watcher.refresh();
    assert.equal(reads, 3);
});
test('un pago sin aprobar no consulta indefinidamente y permite verificar de nuevo', async () => {
    const clock = scheduler();
    let reads = 0;
    const watcher = watchPayment({ ...clock, repeat: true, read: async () => { reads++; return { paymentStatus: 'PENDING' }; },
        onUpdate() {}, onError: assert.fail, onChecking() {} });
    await flush();
    while (clock.tasks.size) { clock.run(); await flush(); }
    assert.equal(reads, 9);
    await watcher.refresh(); assert.equal(reads, 10);
    watcher.stop();
});
test('salir de la pantalla descarta la respuesta pendiente y no crea temporizadores', async () => {
    const clock = scheduler();
    let resolve;
    let reads = 0;
    const watcher = watchPayment({ ...clock, repeat: true, read: () => { reads++; return new Promise(done => { resolve = done; }); },
        onUpdate: assert.fail, onError: assert.fail, onChecking() {} });
    await watcher.refresh();
    assert.equal(reads, 1);
    watcher.stop(); resolve({ paymentStatus: 'PAID' }); await flush();
    assert.equal(clock.tasks.size, 0);
});

test('las respuestas lentas también agotan el plazo de verificación automática', async () => {
    const clock = scheduler();
    let time = 0, reads = 0;
    watchPayment({ ...clock, repeat: true, now: () => time, read: async () => {
        reads++; time += 30000; return { paymentStatus: 'PENDING' };
    }, onUpdate() {}, onError: assert.fail, onChecking() {} });
    await flush();
    while (clock.tasks.size) { clock.run(); await flush(); }
    assert.equal(reads, 3);
});
