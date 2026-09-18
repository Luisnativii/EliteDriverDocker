import { useEffect, useState } from 'react';
import PaymentService, { paymentLabels } from '../../services/paymentService';
import { forgetPayment } from '../../utils/paymentReturn';
import { watchPayment } from '../../utils/watchPayment';

export default function ReservationPayment({ reservationId, initialStatus, initialAmount, autoVerify, onPaymentUpdate }) {
    const [payment, setPayment] = useState({ paymentStatus: initialStatus || 'PENDING', amount: initialAmount });
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState('');
    const [verification, setVerification] = useState(0);

    useEffect(() => {
        if (initialStatus && initialStatus !== 'PENDING') {
            forgetPayment(reservationId, sessionStorage);
            return;
        }
        if (loading) return;
        const watcher = watchPayment({
            read: () => PaymentService.getStatus(reservationId),
            repeat: autoVerify || verification > 0,
            onChecking: setChecking,
            onError: err => setError(err.message),
            onUpdate: data => {
                setPayment(data);
                setError('');
                onPaymentUpdate(reservationId, data);
                if (['PAID', 'PAID_TEST', 'CANCELLED'].includes(data.paymentStatus)) {
                    forgetPayment(reservationId, sessionStorage);
                }
            },
        });
        const onFocus = () => { if (document.visibilityState === 'visible') void watcher.refresh(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onFocus);
        return () => {
            watcher.stop();
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onFocus);
        };
    }, [reservationId, initialStatus, autoVerify, verification, onPaymentUpdate, loading]);

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await PaymentService.createLink(reservationId);
            setPayment(data);
            onPaymentUpdate(reservationId, data);
            PaymentService.openLink(data);
        } catch (err) {
            setError(err.message);
            setVerification(value => value + 1);
        } finally {
            setLoading(false);
        }
    };

    const status = payment.paymentStatus || 'PENDING';
    return (
        <div className="mt-4 border-t border-white/20 pt-4 space-y-3" aria-live="polite" aria-atomic="true">
            <p className={`font-semibold ${status === 'PAID' ? 'text-green-300' : status === 'PAID_TEST' ? 'text-amber-300' : ''}`}>
                {paymentLabels[status] || paymentLabels.PENDING}
            </p>
            {payment.amount != null && <p>Total: <strong>${Number(payment.amount).toFixed(2)} USD</strong></p>}
            {status === 'PAID' && <p className="text-sm text-green-200">Pago recibido. Tu reserva está confirmada.</p>}
            {(payment.production === false || status === 'PAID_TEST') &&
                <p className="text-sm text-amber-200">Modo de pruebas: no se realiza un cobro real.</p>}
            {status === 'PAID_TEST' && <p className="text-sm text-amber-200">El pago de prueba fue aprobado. Esta reserva es de prueba.</p>}
            {status === 'PENDING' && <>
                <p className="text-sm text-gray-300">
                    {checking ? 'Consultando la confirmación de Wompi…' : 'Tu reserva quedará confirmada cuando Wompi apruebe el pago.'}
                </p>
                {autoVerify && !checking && !error && <p className="text-sm text-amber-200">
                    Aún no recibimos la confirmación. Si ya pagaste, espera unos momentos y verifica nuevamente.
                </p>}
                <div className="flex flex-col sm:flex-row gap-2">
                    <button disabled={loading} onClick={handlePayment}
                        className="min-h-11 cursor-pointer rounded-lg bg-red-600 px-4 py-3 font-medium hover:bg-red-700 disabled:opacity-50">
                        {loading ? 'Abriendo Wompi…' : 'Pagar con Wompi'}
                    </button>
                    <button disabled={loading || checking} onClick={() => { setError(''); setVerification(v => v + 1); }}
                        className="min-h-11 cursor-pointer rounded-lg border border-white/30 px-4 py-3 hover:bg-white/10 disabled:opacity-50">
                        {checking ? 'Verificando…' : 'Verificar pago'}
                    </button>
                </div>
            </>}
            {error && <p role="alert" className="text-sm text-amber-200 break-words">{error}</p>}
        </div>
    );
}
