import { test } from 'node:test';
import assert from 'node:assert/strict';
import { overlapsDates, vehicleAvailabilityStatus } from '../src/utils/vehicleAvailability.js';

const vehicle = {id:'car',status:'active',unavailablePeriods:[{startDate:'2038-01-10',endDate:'2038-01-12'}]};
test('un período incluye ambos extremos y admite un solo día', () => {
  for (const [from,to] of [['2038-01-10','2038-01-10'],['2038-01-12','2038-01-13'],['2038-01-09','2038-01-10'],['2038-01-01','2038-01-31']]) {
    assert.equal(overlapsDates('2038-01-10','2038-01-12',from,to),true);
    assert.equal(vehicleAvailabilityStatus(vehicle,from,to),'outOfService');
  }
});
test('fuera del período un vehículo activo vuelve a estar disponible', () => {
  assert.equal(vehicleAvailabilityStatus(vehicle,'2038-01-13','2038-01-15'),'active');
  assert.equal(vehicleAvailabilityStatus(vehicle,'2038-01-01','2038-01-09'),'active');
});
test('un vehículo inactivo siempre queda inactivo y una reserva se distingue del bloqueo', () => {
  assert.equal(vehicleAvailabilityStatus({...vehicle,status:'outOfService'},'2038-01-13','2038-01-15',['car']),'inactive');
  assert.equal(vehicleAvailabilityStatus(vehicle,'2038-01-13','2038-01-15',['car']),'reserved');
  assert.equal(vehicleAvailabilityStatus(vehicle,'2038-01-10','2038-01-11',['car']),'outOfService');
});
