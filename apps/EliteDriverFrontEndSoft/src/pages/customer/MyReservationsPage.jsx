import React, { useEffect, useState } from 'react';
import { useReservation } from '../../hooks/useReservations';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';



const MyReservationPage = () => {
    const { user } = useAuth();
    const { getReservationsByUser, isLoading, error } = useReservation();
    const [reservations, setReservations] = useState([]);
    const { cancelReservation } = useReservation();

    const formatDateLocal = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/El_Salvador', // O ajustá según tu zona
        });
    };






    const handleCancelReservation = (id) => {
        toast.info(
            ({ closeToast }) => (
                <div className="flex flex-col gap-2">
                    <p className="font-medium">¿Deseas cancelar esta reserva?</p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={async () => {
                                const result = await cancelReservation(id);
                                closeToast();

                                if (result.success) {
                                    toast.success(" Reserva cancelada");
                                    setReservations((prev) =>
                                        prev.filter((r) => r.id !== id)
                                    );
                                } else {
                                    toast.error(" Error al cancelar la reserva: " + result.error);
                                }
                            }}
                            className="cursor-pointer px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Sí, cancelar
                        </button>
                        <button
                            onClick={closeToast}
                            className="cursor-pointer px-3 py-1 text-sm bg-gray-300 text-black rounded hover:bg-gray-400"
                        >
                            No
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false, closeOnClick: false }
        );
    };



    useEffect(() => {
        if (user?.id) {
            getReservationsByUser(user.id).then(setReservations);
        }
    }, [user]);

    if (isLoading) return <p className="text-white">Cargando reservas...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    const getDerivedStatus = (reservation) => {
        const now = new Date();
        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);

        if (start > now) return 'Próxima';
        if (start <= now && end >= now) return 'Activa';
        if (end < now) return 'Completada';
        return 'Desconocida';
    };

    const decodeBase64Image = (base64) => {
        if (!base64) return null;

        const isPng = base64.trim().startsWith("iVBOR");
        const isWebp = base64.trim().startsWith("UklGR");

        const mime = isPng
            ? "image/png"
            : isWebp
                ? "image/webp"
                : "image/jpeg";

        return `data:${mime};base64,${base64}`;
    };




    return (
        <div className="py-25 px-10 text-white">
            <h1 className="text-2xl font-bold mb-4">Mis Reservas</h1>

            {reservations.length === 0 ? (
                <p>No tienes reservas registradas.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reservations.map((res) => (
                        <div
                            key={res.id}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15"
                        >
                            <div
                                className="w-full h-40 overflow-hidden rounded-md mb-3"
                            >
                                <img
                                    src={decodeBase64Image(res.vehicle.mainImageBase64)}
                                    alt={res.vehicle.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/images/vehicle-placeholder.jpg';
                                    }}
                                />

                            </div>


                            <h2 className="text-lg font-semibold">{res.vehicle.brand} {res.vehicle.name}</h2>
                            <p className="text-sm text-gray-300 mb-1">Precio por día: ${res.vehicle.pricePerDay.toFixed(2)}</p>

                            <div className="text-sm mt-2 space-y-1">
                                <p><strong>Inicio:</strong> {formatDateLocal(res.startDate)}</p>
                                <p><strong>Fin:</strong> {formatDateLocal(res.endDate)}</p>

                                <div className="flex items-center justify-between mt-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getDerivedStatus(res) === 'Activa' ? 'bg-green-500 text-white' :
                                        getDerivedStatus(res) === 'Próxima' ? 'bg-yellow-500 text-black' :
                                            getDerivedStatus(res) === 'Completada' ? 'bg-blue-500 text-white' :
                                                'bg-gray-500 text-white'
                                        }`}>
                                        {getDerivedStatus(res)}
                                    </span>
                                    {/* Botón cancelar */}
                                    {['Activa', 'Próxima'].includes(getDerivedStatus(res)) && (
                                        <button
                                            onClick={() => handleCancelReservation(res.id)}
                                            className="cursor-pointer ml-2 px-3 py-1 text-sm bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyReservationPage;