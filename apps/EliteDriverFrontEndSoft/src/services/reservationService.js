import { API_BASE_URL, API_ENDPOINTS, buildEndpoint } from '../config/apiConfig';



class ReservationService {
    
    //llamada a API para crear reserva
    static async createReservation(reservationData) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const url = `${API_BASE_URL}${API_ENDPOINTS.RESERVATIONS.CREATE}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify(reservationData),
        });

        if (!response.ok) {
            const errorData = await response.json();

            // Intenta extraer el mensaje dentro del campo "error"
            const rawError = errorData?.error || 'Error al crear la reserva';

            // Si contiene un mensaje entre comillas, lo extraemos
            const match = rawError.match(/"([^"]+)"/);
            const cleanMessage = match && match[1] ? match[1] : rawError;

            throw new Error(cleanMessage);
        }
        const data = await response.json();
        return {
            success: true,
            data
        };
    }

    //eliminar reservacion
    static async deleteReservation(reservationId) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        const url = `${API_BASE_URL}${buildEndpoint(API_ENDPOINTS.RESERVATIONS.CANCEL, { id: reservationId })}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Error al cancelar la reserva');
        }

        return { success: true };
    }


    // Backend espera dd-MM-yyyy, frontend usa yyyy-MM-dd (input date). Conversión centralizada.
    static toBackendDate(isoDate) {
        if (!isoDate) return '';
        const s = String(isoDate).slice(0, 10);
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
        return s;
    }

    //peticion de rango de fechas (requiere login tras parche seguridad; ADMIN ve PII, CUSTOMER ve ocupación sin usuario)
    static async getReservationsByDateRange(startDate, endDate) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const s = this.toBackendDate(startDate);
        const e = this.toBackendDate(endDate);
        const url = `${API_BASE_URL}/reservations/date?startDate=${encodeURIComponent(s)}&endDate=${encodeURIComponent(e)}`;
        const response = await fetch(url,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : [];
        return data;
    }

    // Disponibilidad pública SIN PII (nuevo endpoint tras parche C1/C2). Usar en páginas públicas.
    static async getAvailability(startDate, endDate) {
        const s = this.toBackendDate(startDate);
        const e = this.toBackendDate(endDate);
        const url = `${API_BASE_URL}/reservations/availability?startDate=${encodeURIComponent(s)}&endDate=${encodeURIComponent(e)}`;
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al obtener disponibilidad');
        }
        const text = await response.text();
        return text ? JSON.parse(text) : [];
    }

    // Validar datos de reserva
    static validateReservation(reservationData) {
        const errors = [];

        if (!reservationData.startDate) {
            errors.push('La fecha de inicio es requerida');
        }

        if (!reservationData.endDate) {
            errors.push('La fecha de fin es requerida');
        }

        if (reservationData.startDate && reservationData.endDate) {
            const toDateOnlyString = (d) =>
                new Date(d).toISOString().split('T')[0]; // YYYY-MM-DD

            const start = toDateOnlyString(reservationData.startDate);
            const end = toDateOnlyString(reservationData.endDate);
            const today = toDateOnlyString(new Date());

            if (start < today) {
                errors.push('La fecha de inicio no puede ser anterior a hoy');
            }

            if (end <= start) {
                errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
            }

        }
        if (!reservationData.vehicleId) {
            errors.push('ID del vehículo es requerido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Calcular precio total — base + IVA 13% (igual que backend ReservationPricing)
    static IVA_RATE = 0.13;
    static calculateTotalPrice(startDate, endDate, pricePerDay) {
        if (!startDate || !endDate || !pricePerDay) return { days: 0, subtotal: 0, iva: 0, totalPrice: 0 };

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return { days: 0, subtotal: 0, iva: 0, totalPrice: 0 };
        const subtotal = Math.round((diffDays * pricePerDay + Number.EPSILON) * 100) / 100;
        const iva = Math.round((subtotal * this.IVA_RATE + Number.EPSILON) * 100) / 100;
        const totalPrice = Math.round((subtotal + iva + Number.EPSILON) * 100) / 100;
        return { days: diffDays, subtotal, iva, totalPrice };
    }

    //obtener las reservaciones del usuario
    static async getReservationsByUser(userId) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        const url = `${API_BASE_URL}${API_ENDPOINTS.RESERVATIONS.GET_BY_USER}?userId=${userId}`;


        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al obtener reservas');
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : [];
        return { success: true, data };
    }

    static async getAllReservations() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const url = `${API_BASE_URL}${API_ENDPOINTS.RESERVATIONS.GET_ALL || '/reservations/all'}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al obtener todas las reservas');
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : [];

        // Asegurar que los datos tengan la estructura correcta
        return data.map(reservation => ({
            ...reservation,
            // Asegurar que las fechas estén en formato ISO
            startDate: new Date(reservation.startDate).toISOString(),
            endDate: new Date(reservation.endDate).toISOString(),
            createdAt: reservation.createdAt ? new Date(reservation.createdAt).toISOString() : new Date().toISOString(),
            pricePerDay: reservation.pricePerDay || 0,
            // Asegurar estructura de usuario
            user: {
                id: reservation.user?.id || reservation.userId,
                name: reservation.user?.firstName + ' ' + reservation.user?.lastName || 'Usuario no disponible',
                email: reservation.user?.email || reservation.userEmail || 'email@no-disponible.com',
                dui: reservation.user?.dui || reservation.userDui || 'N/A'
            },
            // Asegurar estructura de vehículo
            vehicle: {
                id: reservation.vehicle?.id || reservation.vehicleId,
                name: reservation.vehicle?.name || reservation.vehicleName || 'Vehículo no disponible',
                brand: reservation.vehicle?.brand || reservation.vehicleBrand || 'N/A',
                model: reservation.vehicle?.model || reservation.vehicleModel || 'N/A',
                type: reservation.vehicle?.vehicleType || reservation.vehicle?.type || 'N/A',
                capacity: reservation.vehicle?.capacity || reservation.vehicleCapacity || 0
            }
        }));
    }


}

export default ReservationService;
