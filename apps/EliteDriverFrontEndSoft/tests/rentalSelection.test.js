import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRentalSelection, restoreRentalSelection, RENTAL_SELECTION_KEY } from '../src/utils/rentalSelection.js';

test('mover la entrega borra una devolución incompatible y conserva una posterior', () => {
    assert.deepEqual(normalizeRentalSelection({ startDate: '2037-12-20', endDate: '2037-12-10' }, '2037-01-01'), { startDate:'2037-12-20', endDate:'' });
    assert.deepEqual(normalizeRentalSelection({ startDate: '2037-12-10', endDate: '2037-12-20' }, '2037-01-01'), { startDate:'2037-12-10', endDate:'2037-12-20' });
});

test('la sesión restaura un rango válido después de recargar', () => {
    const value = { startDate:'2090-11-20', endDate:'2090-11-23' };
    assert.deepEqual(restoreRentalSelection({ getItem: key => key === RENTAL_SELECTION_KEY ? JSON.stringify(value) : null }), value);
});

test('una sesión dañada, inaccesible o vencida permite seguir reservando', () => {
    for (const storage of [{ getItem:()=>'{broken' }, { getItem:()=>{ throw new Error('denied'); } }, { getItem:()=>JSON.stringify({startDate:'2001-01-01',endDate:'2001-01-03'}) }]) {
        assert.deepEqual(restoreRentalSelection(storage), { startDate:'', endDate:'' });
    }
});

test('fechas inexistentes y duración cero no se restauran como un rango válido', () => {
    assert.deepEqual(normalizeRentalSelection({startDate:'2037-02-30',endDate:'2037-03-02'},'2037-01-01'), { startDate:'',endDate:'' });
    assert.deepEqual(normalizeRentalSelection({startDate:'2037-02-10',endDate:'2037-02-10'},'2037-01-01'), { startDate:'2037-02-10',endDate:'' });
});
