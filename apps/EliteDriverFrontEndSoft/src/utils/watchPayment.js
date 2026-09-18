// Consultas consecutivas y acotadas: nunca dos solicitudes simultáneas por reserva.
export function watchPayment({ read, onUpdate, onError, onChecking, repeat = false,
    schedule = setTimeout, unschedule = clearTimeout, now = Date.now }) {
    const delays = repeat ? [2000, 4000, 8000, 15000, 15000, 15000, 15000, 15000] : [];
    const started = now();
    let active = true;
    let reading = false;
    let settled = false;
    let attempt = 0;
    let timer;

    async function refresh() {
        if (!active || reading || settled) return;
        unschedule(timer);
        reading = true;
        onChecking(true);
        try {
            const payment = await read();
            if (!active) return;
            onUpdate(payment);
            settled = ['PAID', 'PAID_TEST', 'CANCELLED'].includes(payment.paymentStatus);
        } catch (error) {
            if (active) onError(error);
        } finally {
            reading = false;
            if (active) {
                if (!settled && attempt < delays.length && now() - started + delays[attempt] < 90000)
                    timer = schedule(refresh, delays[attempt++]);
                else onChecking(false);
            }
        }
    }

    void refresh();
    return {
        refresh,
        stop() { active = false; unschedule(timer); },
    };
}
