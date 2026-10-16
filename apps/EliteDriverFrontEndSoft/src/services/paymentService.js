import { API_BASE_URL } from '../config/apiConfig';
import { rememberPayment } from '../utils/paymentReturn';
export { paymentLabels } from '../utils/reservationStatus';

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

    /**
     * Vuelve a tomar la pre-reserva y renueva la ventana de pago.
     * Responde 409 si otro cliente ya tomó el vehículo; el cuerpo trae las
     * alternativas del mismo tipo que sí están libres.
     */
    static async renewHold(reservationId) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/reservations/${encodeURIComponent(reservationId)}/hold`, {
            method: 'POST',
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.reason || 'No se pudo reservar de nuevo.');
            error.alternatives = Array.isArray(data.alternatives) ? data.alternatives : [];
            throw error;
        }
        return data;
    }

    /** Vehículos del mismo tipo libres para las mismas fechas de la reserva. */
    static getAlternatives(reservationId) {
        return this.request(reservationId, 'alternatives', 'GET');
    }

    static openLink(payment) {
        if (payment.paymentStatus !== 'PENDING') return;
        const url = new URL(payment.paymentUrl);
        if (url.protocol !== 'https:') throw new Error('El enlace de pago recibido no es válido.');
        rememberPayment(payment.reservationId, sessionStorage);
        window.location.assign(url.href);
    }
}
