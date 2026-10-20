// Fechas de calendario inclusivas, igual que las reservas del servidor.
export const overlapsDates = (start, end, from, to) => Boolean(start && end && from && to && start <= to && end >= from);

export function vehicleAvailabilityStatus(vehicle, from, to, occupiedIds = []) {
  if (vehicle.status !== 'active') return 'inactive';
  if ((vehicle.unavailablePeriods || []).some(p => overlapsDates(p.startDate, p.endDate, from, to))) return 'outOfService';
  if (occupiedIds.includes(vehicle.id)) return 'reserved';
  return 'active';
}

export const vehicleStatusLabels = { active: 'Disponible', inactive: 'Inactivo', outOfService: 'Fuera de servicio', reserved: 'Reservado' };
