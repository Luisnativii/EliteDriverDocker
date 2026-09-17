import { API_BASE_URL } from '../config/apiConfig';

export const paymentLabels = {
    PENDING: 'Pago pendiente',
    PAID: 'Pagado',
    PAID_TEST: 'Pago de prueba aprobado',
    CANCELLED: 'Reserva cancelada',
};

export default class PaymentService {
    static async request(reservationId, suffix, method) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/reservations/${encodeURIComponent(reservationId)}/${suffix}`, {
            method,
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'No se pudo consultar el pago. Intenta nuevamente.');
        return data;
    }

    static createLink(reservationId) {
        return this.request(reservationId, 'payment-link', 'POST');
    }

    static getStatus(reservationId) {
        return this.request(reservationId, 'payment', 'GET');
    }

    static openLink(payment) {
        const url = new URL(payment.paymentUrl);
        if (url.protocol !== 'https:') throw new Error('El enlace de pago recibido no es válido.');
        window.location.assign(url.href);
    }
}
