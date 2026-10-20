import { useEffect, useState } from 'react';

/**
 * Cuenta regresiva de la pre-reserva.
 *
 * La reserva retiene el vehículo durante una ventana de pago. Mientras corre,
 * la persona ve cuánto le queda; al llegar a cero la reserva se libera y el
 * auto vuelve al catálogo.
 *
 * @param {string|null} expiresAt - ISO del vencimiento que devuelve el backend.
 * @param {number} fallbackMinutes - Valor por defecto si el servidor no lo envía.
 * @returns {{ restante: number|null, expirada: boolean, minutos: number, segundos: number }}
 */
export function useHoldCountdown(expiresAt, fallbackMinutes = 10) {
    const [restante, setRestante] = useState(null);

    useEffect(() => {
        if (!expiresAt) {
            // El servidor no informa vencimiento: la reserva no expira.
            setRestante(null);
            return;
        }
        const limite = new Date(expiresAt).getTime();
        if (!Number.isFinite(limite)) {
            setRestante(null);
            return;
        }
        const tic = () => setRestante(Math.max(0, limite - Date.now()));
        tic();
        const id = setInterval(tic, 1000);
        return () => clearInterval(id);
    }, [expiresAt]);

    if (restante === null) {
        return { restante: null, expirada: false, minutos: fallbackMinutes, segundos: 0 };
    }

    const total = Math.ceil(restante / 1000);
    return {
        restante,
        expirada: total <= 0,
        minutos: Math.floor(total / 60),
        segundos: total % 60,
    };
}

/** "29:59" o "1:05:00" para pantallas largas. */
export function formatCountdown(minutos, segundos) {
    const mm = String(minutos).padStart(2, '0');
    const ss = String(segundos).padStart(2, '0');
    return `${mm}:${ss}`;
}