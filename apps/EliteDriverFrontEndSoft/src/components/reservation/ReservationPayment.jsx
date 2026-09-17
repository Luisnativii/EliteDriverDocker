import { useEffect, useState } from 'react';
import PaymentService, { paymentLabels } from '../../services/paymentService';

export default function ReservationPayment({ reservationId, initialStatus }) {
    const [payment, setPayment] = useState({ paymentStatus: initialStatus });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        if (initialStatus) {
            PaymentService.getStatus(reservationId)
                .then(data => { if (active) setPayment(data); })
                .catch(err => { if (active) setError(err.message); });
        }
        return () => { active = false; };
    }, [reservationId, initialStatus]);

    const handlePayment = async (open) => {
        setLoading(true);
        setError('');
        try {
            const data = open ? await PaymentService.createLink(reservationId) : await PaymentService.getStatus(reservationId);
            setPayment(data);
            if (open) PaymentService.openLink(data);
            else if (data.paymentStatus === 'PENDING') setError('El pago aún no ha sido confirmado. Puedes volver a consultar en unos momentos.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!initialStatus) return null;

    return (
        <div className="mt-4 border-t border-white/20 pt-3 space-y-2">
            <p className="font-medium">{paymentLabels[payment.paymentStatus] || 'Pago pendiente'}</p>
            {payment.amount != null && <p>Total: ${Number(payment.amount).toFixed(2)} USD</p>}
            {payment.production === false && <p className="text-sm text-amber-300">Modo de pruebas: no se realiza un cobro real.</p>}
            {payment.paymentStatus === 'PENDING' && (
                <div className="flex flex-wrap gap-2">
                    <button disabled={loading} onClick={() => handlePayment(true)}
                        className="cursor-pointer rounded-md bg-red-600 px-3 py-2 hover:bg-red-700 disabled:opacity-50">
                        {loading ? 'Procesando...' : 'Pagar con Wompi'}
                    </button>
                    <button disabled={loading} onClick={() => handlePayment(false)}
                        className="cursor-pointer rounded-md border border-white/30 px-3 py-2 disabled:opacity-50">
                        Verificar pago
                    </button>
                </div>
            )}
            {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}
        </div>
    );
}
