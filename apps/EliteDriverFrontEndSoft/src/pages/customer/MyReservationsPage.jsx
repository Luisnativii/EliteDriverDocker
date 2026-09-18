import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useReservation } from '../../hooks/useReservations';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import ReservationPayment from '../../components/reservation/ReservationPayment';
import { reservationStatus, paymentStatus, statusLabels } from '../../utils/reservationStatus';
import { returningReservation } from '../../utils/paymentReturn';

export default function MyReservationPage() {
    const { user } = useAuth();
    const { getReservationsByUser, isLoading, error } = useReservation();
    const { cancelReservation } = useReservation();
    const [reservations, setReservations] = useState([]);
    const [cancelling, setCancelling] = useState(null);
    const [returnedId] = useState(() => returningReservation(window.location.search, sessionStorage));
    const updatePayment = useCallback((id, data) => {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, paymentStatus: data.paymentStatus || r.paymentStatus } : r));
    }, []);
    const reload = useCallback(() => {
        if (user?.id) void getReservationsByUser(user.id).then(setReservations);
    }, [user?.id, getReservationsByUser]);
    useEffect(reload, [reload]);
    const formatDate = value => String(value).slice(0, 10).split('-').reverse().join('/');

    const requestCancel = id => {
        toast.info(({ closeToast }) => (
            <div className="space-y-3">
                <p>¿Deseas cancelar esta reserva pendiente de pago?</p>
                <div className="flex gap-2">
                    <button onClick={async () => {
                        closeToast(); setCancelling(id);
                        const result = await cancelReservation(id);
                        setCancelling(null);
                        if (result.success) {
                            toast.success('Reserva cancelada');
                            setReservations(prev => prev.filter(r => r.id !== id));
                        } else {
                            toast.error(result.error);
                            reload();
                        }
                    }} className="min-h-11 px-4 rounded-lg bg-red-600 text-white">Sí, cancelar</button>
                    <button onClick={closeToast} className="min-h-11 px-4 rounded-lg bg-gray-200 text-black">Mantener</button>
                </div>
            </div>
        ), { autoClose: false, closeOnClick: false });
    };

    return (
        <div className="pt-25 pb-10 px-4 sm:px-6 lg:px-8 text-white max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mis reservas</h1>
            <p className="text-gray-300 mb-6">Consulta tus fechas y el estado de tu pago.</p>
            {isLoading ? <p role="status">Cargando reservas…</p> : error ? (
                <div role="alert" className="rounded-xl bg-red-500/10 border border-red-400/30 p-4 space-y-3">
                    <p>{error}</p><button onClick={reload} className="min-h-11 px-4 rounded-lg border border-white/30">Volver a intentar</button>
                </div>
            ) : reservations.length === 0 ? (
                <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-center space-y-4">
                    <p>Aún no tienes reservas.</p>
                    <Link to="/customer/vehicles" className="inline-flex min-h-11 items-center px-5 rounded-lg bg-red-600">Ver vehículos</Link>
                </div>
            ) : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...reservations].sort((a, b) => Number(b.id === returnedId) - Number(a.id === returnedId)).map(res => {
                    const vehicle = res.vehicle || {};
                    const status = reservationStatus(res);
                    const isReturning = res.id === returnedId;
                    return <article key={res.id} className={`min-w-0 bg-white/10 border rounded-2xl p-4 shadow-lg ${isReturning ? 'border-red-400/70' : 'border-white/20'}`}>
                        {isReturning && <p className="text-sm text-red-200 mb-3">Seguimiento de tu pago en Wompi</p>}
                        <div className="relative w-full h-40 overflow-hidden rounded-xl mb-4 bg-neutral-800">
                            <Car className="absolute inset-0 m-auto w-16 h-16 text-neutral-600" aria-hidden="true" />
                            {vehicle.mainImageUrl && <img src={vehicle.mainImageUrl} alt={vehicle.name || 'Vehículo'}
                                className="relative h-full w-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />}
                        </div>
                        <h2 className="text-lg font-semibold break-words">{vehicle.brand} {vehicle.name}</h2>
                        <p className="text-sm text-gray-300 mt-1">Precio por día: ${Number(vehicle.pricePerDay || 0).toFixed(2)}</p>
                        <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
                            <div><dt className="text-gray-400">Inicio</dt><dd className="font-medium mt-1">{formatDate(res.startDate)}</dd></div>
                            <div><dt className="text-gray-400">Fin</dt><dd className="font-medium mt-1">{formatDate(res.endDate)}</dd></div>
                        </dl>
                        <p className={`mt-4 inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${status === 'activa' ? 'bg-green-500/20 text-green-200' : status === 'prueba' ? 'bg-purple-500/20 text-purple-200' : 'bg-white/10 text-gray-200'}`}>
                            {statusLabels[status]}
                        </p>
                        <ReservationPayment reservationId={res.id} initialStatus={res.paymentStatus}
                            initialAmount={res.totalPrice} autoVerify={isReturning} onPaymentUpdate={updatePayment} />
                        {paymentStatus(res) === 'PENDING' && <button disabled={cancelling !== null}
                            onClick={() => requestCancel(res.id)} className="mt-4 w-full min-h-11 text-sm underline text-gray-300 hover:text-white disabled:opacity-50">
                            {cancelling === res.id ? 'Cancelando…' : 'Cancelar reserva pendiente'}
                        </button>}
                    </article>;
                })}
            </div>}
        </div>
    );
}
