import React, { useState, useEffect } from 'react';
import { useDateContext } from '../../context/DateContext';
import ReservationService from '../../services/reservationService';
import PaymentService from '../../services/paymentService';
import { useReservation } from '../../hooks/useReservations';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';



const FacturationDetail = ({ vehicle }) => {
    const { user } = useAuth();
    const { createReservation, isLoading } = useReservation();
    const { startDate: contextStartDate, endDate: contextEndDate, setStartDate, setEndDate } = useDateContext();
    const [startDate, setLocalStartDate] = useState(contextStartDate || '');
    const [endDate, setLocalEndDate] = useState(contextEndDate || '');
    const [totalDays, setTotalDays] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [iva, setIva] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [errors, setErrors] = useState([]);
    const [createdReservationId, setCreatedReservationId] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [step, setStep] = useState('Fechas');
    const navigate = useNavigate();

    const todayLocal = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    useEffect(() => {
        setCreatedReservationId(null);
        setStep('Fechas');
    }, [vehicle?.id]);



    // Sincronizar con el contexto al montar el componente
    useEffect(() => {
        if (contextStartDate && !startDate) {
            setLocalStartDate(contextStartDate);
        }
        if (contextEndDate && !endDate) {
            setLocalEndDate(contextEndDate);
        }
    }, [contextStartDate, contextEndDate, startDate, endDate]);

    // Actualizar fechas locales y contexto
    const handleStartDateChange = (newDate) => {
        setLocalStartDate(newDate);
        setStartDate(newDate);
    };

    const handleEndDateChange = (newDate) => {
        setLocalEndDate(newDate);
        setEndDate(newDate);
    };

    // Calcular días y precio total cuando cambien las fechas usando el servicio
    useEffect(() => {
        if (startDate && endDate && vehicle) {
            const calculation = ReservationService.calculateTotalPrice(
                startDate,
                endDate,
                vehicle.pricePerDay ?? vehicle.price
            );
            setTotalDays(calculation.days);
            setSubtotal(calculation.subtotal || 0);
            setIva(calculation.iva || 0);
            setTotalPrice(calculation.totalPrice);
        } else {
            setTotalDays(0);
            setSubtotal(0);
            setIva(0);
            setTotalPrice(0);
        }
    }, [startDate, endDate, vehicle]);
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
            setStep('Pagando');
            let reservationId = createdReservationId;
            if (!reservationId) {
                const result = await createReservation(reservationData);
                if (!result.success) {
                    setErrors([result.error || 'Error al crear la reserva']);
                    setStep('Resumen');
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
            setStep('Resumen');
        } finally {
            setPaymentLoading(false);
        }
    };



    if (!vehicle || !vehicle.id) return null;


    return (
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6" aria-label="Progreso de reserva">
                {['Fechas', 'Resumen', 'Pagando'].map((s, i) => {
                    const order = ['Fechas', 'Resumen', 'Pagando'];
                    const active = order.indexOf(step) >= i;
                    return (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <span className={`min-h-7 min-w-7 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</span>
                            <span className={`text-xs sm:text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
                            {i < 2 && <div className={`flex-1 h-0.5 rounded ${order.indexOf(step) > i ? 'bg-red-600' : 'bg-gray-200'}`} />}
                        </div>
                    );
                })}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Detalles de la Reserva</h3>

            <div className="space-y-6">
                {/* Mostrar errores si existen */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Se encontraron los siguientes errores:
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc pl-5 space-y-1">
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mostrar si las fechas vienen del contexto */}
                {(contextStartDate || contextEndDate) && (
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
                        onChange={(e) => { handleStartDateChange(e.target.value); setStep('Resumen'); }}
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
                        onChange={(e) => { handleEndDateChange(e.target.value); setStep('Resumen'); }}
                        min={startDate || todayLocal()}
                        className="w-full min-h-11 min-w-0 text-base px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Resumen de la reserva con IVA */}
                {totalDays > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Resumen de la Reserva</h4>
                        <div className="space-y-2 text-[15px]">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Días de alquiler:</span>
                                <span className="font-medium">{totalDays} día{totalDays > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Precio por día (sin IVA):</span>
                                <span className="font-medium">${Number(vehicle.pricePerDay ?? vehicle.price ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">${Number(subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">IVA 13%:</span>
                                <span className="font-medium">${Number(iva).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold text-gray-900">Total a pagar:</span>
                                    <span className="text-2xl font-bold text-stone-900">${Number(totalPrice).toFixed(2)} USD</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Sin depósito en garantía. Mayores de 18 años con licencia vigente.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón de alquilar — 1 clic crea + paga */}
                <button
                    onClick={handleReservation}
                    disabled={!startDate || !endDate || totalDays <= 0 || isLoading || paymentLoading}
                    aria-busy={isLoading || paymentLoading}
                    className="w-full min-h-12 cursor-pointer bg-red-600 text-white py-3.5 px-4 rounded-xl font-semibold text-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading || paymentLoading ? 'Abriendo pago seguro…' : createdReservationId ? 'Retomar pago con Wompi' : `Pagar $${Number(totalPrice || 0).toFixed(2)} con Wompi`}
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
