import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import PaymentService, { paymentLabels } from '../../services/paymentService';
import { forgetPayment } from '../../utils/paymentReturn';
import { watchPayment } from '../../utils/watchPayment';
import { useHoldCountdown, formatCountdown } from '../../hooks/useHoldCountdown';
import HoldExpiredPanel from './HoldExpiredPanel';

export default function ReservationPayment({ reservationId, initialStatus, initialAmount, autoVerify, onPaymentUpdate, reservedName = '' }) {
    const [payment, setPayment] = useState({ paymentStatus: initialStatus || 'PENDING', amount: initialAmount });
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [linkError, setLinkError] = useState('');
    const error = linkError || statusError;
    const [verification, setVerification] = useState(0);
    const [lastChecked, setLastChecked] = useState(null);
    const [holdExpiresAt, setHoldExpiresAt] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [holdLoading, setHoldLoading] = useState(false);
    const [holdError, setHoldError] = useState('');
    const { expirada, minutos, segundos, restante } = useHoldCountdown(holdExpiresAt);

    // El vencimiento solo importa mientras la reserva sigue sin pagarse.
    useEffect(() => {
        const estado = payment?.paymentStatus;
        if (!expirada || (estado !== 'PENDING' && estado !== 'CANCELLED')) return;
        void loadAlternatives();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expirada]);

    async function loadAlternatives() {
        try {
            const list = await PaymentService.getAlternatives(reservationId);
            setAlternatives(Array.isArray(list) ? list : []);
        } catch (err) {
            // Sin alternativas no pasa nada: se ofrece volver a reservar.
            setAlternatives([]);
        }
    }

    // Volver a tomar la pre-reserva si el vehículo sigue libre.
    async function handleRenew() {
        setHoldLoading(true);
        setHoldError('');
        try {
            const result = await PaymentService.renewHold(reservationId);
            setHoldExpiresAt(result?.reservation?.holdExpiresAt || null);
            setAlternatives([]);
            setVerification(v => v + 1);
        } catch (err) {
            setHoldError(err.message || 'Ya no se pudo reservar.');
            if (err.alternatives?.length) setAlternatives(err.alternatives);
            else void loadAlternatives();
        } finally {
            setHoldLoading(false);
        }
    }

    useEffect(() => {
        if (initialStatus && initialStatus !== 'PENDING') {
            forgetPayment(reservationId, sessionStorage);
            return;
        }
        if (loading) return;
        const watcher = watchPayment({
            read: () => PaymentService.getStatus(reservationId),
            repeat: !linkError && (autoVerify || verification > 0),
            onChecking: setChecking,
            onError: err => { setStatusError(err.message); setLastChecked(new Date()); },
            onUpdate: data => {
                setPayment(data);
                if (data.holdExpiresAt) setHoldExpiresAt(data.holdExpiresAt);
                setStatusError('');
                setLastChecked(new Date());
                onPaymentUpdate(reservationId, data);
                if (['PAID', 'PAID_TEST', 'CANCELLED'].includes(data.paymentStatus)) {
                    setLinkError('');
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
    }, [reservationId, initialStatus, autoVerify, verification, onPaymentUpdate, loading, linkError]);

    const handlePayment = async () => {
        setLoading(true);
        setLinkError('');
        setStatusError('');
        setChecking(false);
        try {
            const data = await PaymentService.createLink(reservationId);
            setPayment(data);
            if (data.holdExpiresAt) setHoldExpiresAt(data.holdExpiresAt);
            onPaymentUpdate(reservationId, data);
            PaymentService.openLink(data);
        } catch (err) {
            setLinkError(err.message);
            setLastChecked(new Date());
        } finally {
            setLoading(false);
        }
    };

    const retry = () => { setStatusError(''); setVerification(v => v + 1); };

    const status = payment.paymentStatus || 'PENDING';
    const isServerMisconfigured = /no están configurados|configura la URL|503/i.test(error);
    return (
        <div className="mt-4 border-t border-white/20 pt-4 space-y-3" aria-live="polite" aria-atomic="true">
            <div className="flex items-center justify-between gap-2">
                <p className={`font-semibold ${status === 'PAID' ? 'text-green-300' : status === 'PAID_TEST' ? 'text-amber-300' : status === 'CANCELLED' ? 'text-red-300' : ''}`}>
                    {status === 'PAID' ? '✅ ' : status === 'PENDING' ? '⏳ ' : ''}{paymentLabels[status] || paymentLabels.PENDING}
                </p>
                {lastChecked && status === 'PENDING' && (
                    <p className="text-xs text-gray-400">Última verificación: {lastChecked.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                )}
            </div>
            {payment.amount != null && <p>Total: <strong>${Number(payment.amount).toFixed(2)} USD</strong></p>}

            {/* Ventana de pago: mientras corre, el auto está reservado a tu nombre. */}
            {restante !== null && status === 'PENDING' && !expirada && (
                <div
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                        restante < 5 * 60 * 1000
                            ? 'bg-red-500/15 border-red-400/50 text-red-100'
                            : 'bg-white/5 border-white/15 text-white/80'
                    }`}
                >
                    <Clock size={16} aria-hidden="true" className="shrink-0" />
                    <span>
                        Te reservamos este auto por{' '}
                        <strong className="tabular-nums">{formatCountdown(minutos, segundos)}</strong>
                        {restante < 5 * 60 * 1000 && ' — apúrate, casi se libera'}
                    </span>
                </div>
            )}

            {status === 'PAID' && <p className="text-sm text-green-200">Pago recibido. Tu reserva está confirmada.</p>}
            {(payment.production === false || status === 'PAID_TEST') &&
                <p className="text-sm text-amber-200">Modo de pruebas: no se realiza un cobro real.</p>}
            {status === 'PAID_TEST' && <p className="text-sm text-amber-200">El pago de prueba fue aprobado. Esta reserva es de prueba.</p>}
            {status === 'CANCELLED' && <p className="text-sm text-red-200">Esta reserva fue cancelada. Crea una nueva si deseas reservar.</p>}
            {error && (
                <div role="alert" className={`rounded-xl border p-3 text-sm space-y-2 ${isServerMisconfigured ? 'bg-red-500/15 border-red-400/40 text-red-100' : 'bg-amber-500/10 border-amber-400/30 text-amber-100'}`}>
                    <p className="font-semibold">{isServerMisconfigured ? 'Pagos deshabilitados en este servidor' : 'No se pudo completar la acción'}</p>
                    <p className="break-words opacity-90">{error}</p>
                    <button onClick={retry} className="min-h-11 px-4 rounded-lg bg-white/15 hover:bg-white/25 font-medium">
                        Reintentar verificación
                    </button>
                </div>
            )}
            {status === 'PENDING' && !expirada && <>
                <p className="text-sm text-gray-300">
                    {checking ? 'Consultando la confirmación del pago…' : 'Tu reserva quedará confirmada cuando Wompi apruebe el pago.'}
                </p>
                {autoVerify && !checking && !error && <p className="text-sm text-amber-200">
                    Volviste de Wompi pero aún no hay confirmación. Si ya pagaste, espera y pulsa Verificar pago.
                </p>}
                <div className="flex flex-col sm:flex-row gap-2">
                    <button disabled={loading || checking} onClick={handlePayment}
                        className="min-h-11 cursor-pointer rounded-lg bg-red-600 px-4 py-3 font-medium hover:bg-red-700 disabled:opacity-50">
                        {loading ? 'Abriendo Wompi…' : 'Pagar con Wompi'}
                    </button>
                    <button disabled={loading || checking} onClick={retry}
                        className="min-h-11 cursor-pointer rounded-lg border border-white/30 px-4 py-3 hover:bg-white/10 disabled:opacity-50">
                        {checking ? 'Verificando…' : 'Verificar pago'}
                    </button>
                </div>
            </>}

            {/* Se liberó el auto: se puede retomarlo o elegir otro del mismo tipo. */}
            {expirada && (status === 'PENDING' || status === 'CANCELLED') && (
                <HoldExpiredPanel
                    onRetry={handleRenew}
                    onChooseAlternative={v => onPaymentUpdate(reservationId, { chooseVehicle: v.id })}
                    alternatives={alternatives}
                    loading={holdLoading}
                    error={holdError}
                    reservedName={reservedName}
                />
            )}
        </div>
    );
}
