import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentBusinessMonth, shiftMonth, pendingHolds, customerPriority, countdownText, rentalLabel, matchesOwnership } from '../src/utils/customerManagement.js';

test('mes actual respeta El Salvador al cambiar el mes UTC',()=>{
  assert.equal(currentBusinessMonth(new Date('2026-11-01T05:59:59Z')),'2026-10');
  assert.equal(currentBusinessMonth(new Date('2026-11-01T06:00:00Z')),'2026-11');
});
test('navegación mensual cruza años y febrero sin saltos',()=>{
  assert.equal(shiftMonth('2026-01',-1),'2025-12');assert.equal(shiftMonth('2026-12',1),'2027-01');assert.equal(shiftMonth('2028-03',-1),'2028-02');
});
test('primero clientes activos, después pendientes y luego sin reserva activa',()=>{
  const now=Date.parse('2026-10-20T18:00:00Z');
  const pending={activeCount:0,pendingHolds:[{expiresAt:'2026-10-20T18:10:00Z'}]};
  assert.equal(customerPriority({activeCount:1,pendingHolds:[]},now),0);assert.equal(customerPriority(pending,now),1);assert.equal(customerPriority({activeCount:0,pendingHolds:[]},now),2);
  assert.equal(pendingHolds(pending,now+600000).length,0);assert.equal(customerPriority(pending,now+600000),2);
});
test('contador conserva el vencimiento exacto y maneja datos antiguos sin inventarlos',()=>{
  const now=Date.parse('2026-10-20T18:00:00Z');assert.equal(countdownText('2026-10-20T18:10:00Z',now),'10:00');assert.equal(countdownText('2026-10-20T18:10:00Z',now+600000),'00:00');assert.match(countdownText(null,now),/Sin vencimiento/);
});
test('historial distingue pagos reales, pruebas y cancelaciones',()=>{
  const reservation={paymentStatus:'PAID',startDate:'2026-10-19',endDate:'2026-10-21'};
  assert.equal(rentalLabel(reservation,'2026-10-20'),'Activa');assert.equal(rentalLabel(reservation,'2026-10-18'),'Próxima');assert.equal(rentalLabel(reservation,'2026-10-22'),'Completada');
  assert.equal(rentalLabel({...reservation,paymentStatus:'PAID_TEST'},'2026-10-20'),'Pago de prueba');assert.equal(rentalLabel({...reservation,paymentStatus:'CANCELLED'},'2026-10-20'),'Cancelada');
});
test('propiedad combina todos, propios y proveedores sin confundir vacíos',()=>{
  const own={supplier:null};const supplied={supplier:{id:'supplier-1',name:'Proveedor'}};
  assert.equal(matchesOwnership(own,'own'),true);assert.equal(matchesOwnership(supplied,'own'),false);assert.equal(matchesOwnership(supplied,'supplier-1'),true);assert.equal(matchesOwnership(own,'supplier-1'),false);assert.equal(matchesOwnership(supplied,'all'),true);
});
