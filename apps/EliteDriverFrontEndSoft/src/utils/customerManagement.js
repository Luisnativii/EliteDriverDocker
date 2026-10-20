import { rentalToday } from './rentalDates.js';

export const currentBusinessMonth = (now = new Date()) => rentalToday(now).slice(0, 7);
export function shiftMonth(month, amount) {
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
export function pendingHolds(customer, now) {
  return (customer.pendingHolds || []).filter(h => !h.expiresAt || Date.parse(h.expiresAt) > now);
}
export function customerPriority(customer, now) {
  return customer.activeCount > 0 ? 0 : pendingHolds(customer, now).length ? 1 : 2;
}
export function countdownText(expiresAt, now) {
  if (!expiresAt) return 'Sin vencimiento registrado';
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
  if (!Number.isFinite(seconds)) return 'Sin vencimiento registrado';
  return `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
}
export function rentalLabel(reservation, today = rentalToday()) {
  if (reservation.paymentStatus === 'CANCELLED') return 'Cancelada';
  if (reservation.paymentStatus === 'PAID_TEST') return 'Pago de prueba';
  if (reservation.paymentStatus !== 'PAID') return 'Pago pendiente';
  if (reservation.startDate > today) return 'Próxima';
  if (reservation.endDate < today) return 'Completada';
  return 'Activa';
}
export function matchesOwnership(vehicle, ownership) {
  return ownership === 'all' || (ownership === 'own' ? !vehicle.supplier : vehicle.supplier?.id === ownership);
}
