import React, { useState, useEffect, useRef } from 'react';
import { useDateContext } from '../../context/DateContext';
import ReservationService from '../../services/reservationService';
import PaymentService from '../../services/paymentService';
import { useReservation } from '../../hooks/useReservations';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { rentalToday } from '../../utils/rentalDates.js';



const FacturationDetail = ({ vehicle }) => {
    const { user } = useAuth();
    const { createReservation, isLoading } = useReservation();
    const { startDate, endDate, setStartDate, setEndDate } = useDateContext();
    const [errors, setErrors] = useState([]);
    const [createdReservationId, setCreatedReservationId] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const navigate = useNavigate();

    const todayLocal = rentalToday;
    const errorRef = useRef(null);
    const { days: totalDays, subtotal, iva, totalPrice } = ReservationService.calculateTotalPrice(startDate, endDate, vehicle?.pricePerDay ?? vehicle?.price);
    const validation = ReservationService.validateReservation({ vehicleId: vehicle?.id, startDate, endDate });
    const step = paymentLoading || isLoading ? 'Pagando' : validation.isValid ? 'Resumen' : 'Fechas';
    useEffect(() => {
        if (errors.length) {
            errorRef.current?.focus({ preventScroll: true });
            errorRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [errors]);

    useEffect(() => {
        setCreatedReservationId(null);
    }, [vehicle?.id]);



    const handleStartDateChange = value => { setErrors([]); setStartDate(value); };
    const handleEndDateChange = value => { setErrors([]); setEndDate(value); };
    // Flujo en 1 clic: crea reserva (si no existe) y abre Wompi. Sin depósito, +IVA, 18+.
    const handleReservation = async () => {
        setErrors([]);
        if (!vehicle || !vehicle.id) {
            setErrors(['No se pudo obtener la información del vehículo. Intenta nuevamente.']);
            return;
        }
        if (!user?.id) {
            navigate('/login', { state: { redirectTo: `/customer/reservation-page/${vehicle.id}` } });
            return;
        }

        const reservationData = {
            vehicleId: vehicle.id,
            userId: user?.id,
            startDate,
            endDate
        };

        const validation = ReservationService.validateReservation(reservationData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            toast.warn('Verifica los campos del formulario');
            return;
        }

        try {
            setPaymentLoading(true);
            let reservationId = createdReservationId;
            if (!reservationId) {
                const result = await createReservation(reservationData);
                if (!result.success) {
                    setErrors([result.error || 'Error al crear la reserva']);
                    return;
                }
                reservationId = result.data.id;
                setCreatedReservationId(reservationId);
            }

            const payment = await PaymentService.createLink(reservationId);
            toast.info('Abriendo pago seguro con Wompi…');
            PaymentService.openLink(payment);
        } catch (error) {
            const cleanMessage = error.message || 'No se pudo iniciar el pago.';
            setErrors([cleanMessage]);
            toast.error(cleanMessage);
        } finally {
            setPaymentLoading(false);
        }
    };



    if (!vehicle || !vehicle.id) return null;


    return (
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-2 mb-6" aria-label="Progreso de reserva">
                {['Fechas', 'Resumen', 'Pagando'].map((s, i) => {
                    const order = ['Fechas', 'Resumen', 'Pagando'];
                    const active = order.indexOf(step) >= i;
                    return (
                        <div key={s} aria-current={step === s ? "step" : undefined} className="flex min-w-0 flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                            <span className={`min-h-7 min-w-7 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</span>
                            <span className={`text-xs sm:text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
                        </div>
                    );
                })}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Detalles de la Reserva</h3>

            <div className="space-y-6">
                {/* Mostrar si las fechas vienen del contexto */}
                {(startDate || endDate) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-blue-800 text-sm">
                            📅 Fechas seleccionadas previamente han sido cargadas
                        </p>
                    </div>
                )}

                {/* Fecha de inicio */}
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Inicio
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        disabled={!!createdReservationId || paymentLoading || isLoading}
                        onChange={(e) => { handleStartDateChange(e.target.value); }}
                        min={todayLocal()}
                        className="w-full min-h-11 min-w-0 text-base px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Fecha de fin */}
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Fin
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        disabled={!!createdReservationId || paymentLoading || isLoading}
                        onChange={(e) => { handleEndDateChange(e.target.value); }}
                        min={startDate || todayLocal()}
                        className="w-full min-h-11 min-w-0 text-base px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Resumen de la reserva con IVA */}
                {totalDays > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Resumen de la Reserva</h4>
                        <div className="space-y-2 text-[15px]">
                            <div className="flex flex-wrap justify-between gap-2">
                                <span className="text-gray-600">Días de alquiler:</span>
                                <span className="font-medium">{totalDays} día{totalDays > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <span className="text-gray-600">Precio por día (sin IVA):</span>
                                <span className="font-medium">${Number(vehicle.pricePerDay ?? vehicle.price ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">${Number(subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2">
                                <span className="text-gray-600">IVA 13%:</span>
                                <span className="font-medium">${Number(iva).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex flex-wrap justify-between gap-2">
                                    <span className="text-lg font-semibold text-gray-900">Total a pagar:</span>
                                    <span className="text-xl sm:text-2xl font-bold text-stone-900 whitespace-nowrap">${Number(totalPrice).toFixed(2)} USD</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Sin depósito en garantía. Mayores de 18 años con licencia vigente.</p>
                            </div>
                        </div>
                    </div>
                )}

                {errors.length > 0 && <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 outline-none"><p className="font-semibold mb-2">Revisa tu reserva</p><ul className="list-disc pl-5">{errors.map((message, index) => <li key={index}>{message}</li>)}</ul></div>}
                {!validation.isValid && !createdReservationId && <p role="status" className="text-sm text-gray-600">Selecciona la entrega y una devolución posterior para continuar.</p>}
                {/* Botón de alquilar — 1 clic crea + paga */}
                <button
                    onClick={handleReservation}
                    disabled={!validation.isValid || isLoading || paymentLoading}
                    aria-busy={isLoading || paymentLoading}
                    className="w-full min-h-12 cursor-pointer bg-red-600 text-white py-3.5 px-4 rounded-xl font-semibold text-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading || paymentLoading ? 'Abriendo pago seguro…' : createdReservationId ? 'Retomar pago con Wompi' : !validation.isValid ? 'Selecciona tus fechas' : `Pagar $${Number(totalPrice || 0).toFixed(2)} con Wompi`}
                </button>
                {createdReservationId && (
                    <button onClick={() => navigate('/customer/my-reservations')} className="w-full min-h-11 underline text-gray-700 text-sm">
                        Ya tienes reserva creada. Ver mis reservas
                    </button>
                )}

                {/* Información adicional */}
                <div className="text-sm text-gray-600 mt-4 space-y-1">
                    <p>• Pago 100% en línea con Wompi, confirmación inmediata.</p>
                    <p>• Tu reserva se confirma cuando Wompi aprueba el pago.</p>
                    <p>• Si algo falla, retoma el pago desde Mis reservas sin crear otra.</p>
                </div>
            </div>
        </div>
    );
};

export default FacturationDetail;
