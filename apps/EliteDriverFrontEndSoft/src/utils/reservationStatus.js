export const paymentLabels = {
    PENDING: 'Pago pendiente',
    PAID: 'Pagado',
    PAID_TEST: 'Pago de prueba aprobado',
    CANCELLED: 'Reserva cancelada',
};

export const statusLabels = {
    pendiente: 'Pendiente de pago',
    prueba: 'Prueba aprobada',
    cancelada: 'Cancelada',
    activa: 'Activa',
    próxima: 'Próxima',
    completada: 'Completada',
    desconocida: 'Fechas no disponibles',
};

export function paymentStatus(reservation) {
    return Object.hasOwn(paymentLabels, reservation.paymentStatus) ? reservation.paymentStatus : 'PENDING';
}

export function holdsReservationDates(reservation) {
    return paymentStatus(reservation) !== 'CANCELLED';
}

export function localReservationDate(value, endOfDay = false) {
    const date = String(value ?? '').slice(0, 10);
    return new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00'}`);
}

export function reservationStatus(reservation, now = new Date()) {
    const payment = paymentStatus(reservation);
    if (payment === 'PENDING') return 'pendiente';
    if (payment === 'PAID_TEST') return 'prueba';
    if (payment === 'CANCELLED') return 'cancelada';
    const start = localReservationDate(reservation.startDate);
    const end = localReservationDate(reservation.endDate, true);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return 'desconocida';
    if (start > now) return 'próxima';
    if (end < now) return 'completada';
    return 'activa';
}

export function reservationStats(reservations, now = new Date()) {
    const paid = reservations.filter(r => paymentStatus(r) === 'PAID');
    return {
        total: paid.length,
        registered: reservations.length,
        pending: reservations.filter(r => paymentStatus(r) === 'PENDING').length,
        test: reservations.filter(r => paymentStatus(r) === 'PAID_TEST').length,
        active: paid.filter(r => reservationStatus(r, now) === 'activa').length,
        upcoming: paid.filter(r => reservationStatus(r, now) === 'próxima').length,
        completed: paid.filter(r => reservationStatus(r, now) === 'completada').length,
        totalRevenue: paid.reduce((sum, r) => sum + (Number(r.totalPrice) || 0), 0),
    };
}
