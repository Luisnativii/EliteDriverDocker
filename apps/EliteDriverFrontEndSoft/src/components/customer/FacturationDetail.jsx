import React, { useState, useEffect } from 'react';
import { useDateContext } from '../../context/DateContext';
import ReservationService from '../../services/reservationService';
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
    const [totalPrice, setTotalPrice] = useState(0);
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();
    //formato de fecha
        const formatDateLocal = (dateString) => {
            const date = new Date(dateString + 'T00:00'); // forzar 00:00 local
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        };



    // Sincronizar con el contexto al montar el componente
    useEffect(() => {
        if (contextStartDate && !startDate) {
            setLocalStartDate(contextStartDate);
        }
        if (contextEndDate && !endDate) {
            setLocalEndDate(contextEndDate);
        }
    }, [contextStartDate, contextEndDate]);

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
                vehicle.price
            );
            setTotalDays(calculation.days);
            setTotalPrice(calculation.totalPrice);
        } else {
            setTotalDays(0);
            setTotalPrice(0);
        }
    }, [startDate, endDate, vehicle]);
    const handleReservation = async () => {
        setErrors([]);
        if (!vehicle || !vehicle.id) {
            setErrors(['❌ No se pudo obtener la información del vehículo. Intenta nuevamente.']);
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
            setIsLoading(false);
            return;
        }

        try {
            const result = await createReservation(reservationData);

            if (result.success) {
                toast.success('¡Reserva realizada con éxito!');
                navigate('/customer/my-reservations');
                return; // Detener ejecución después de redirigir
            } else {
                setErrors([result.error || 'Error desconocido al crear la reserva']);
            }
        } catch (error) {
            const raw = error.message || '';
            const match = raw.match(/"([^"]+)"/); // busca el texto dentro de comillas

            const cleanMessage = match && match[1]
                ? match[1] // extrae solo el mensaje real, sin códigos
                : '❌ Error al crear la reserva.';

            setErrors([cleanMessage]);
            toast.error(cleanMessage);
        }
    };



    if (!vehicle || !vehicle.id) return null;


    return (
        <div className="bg-white rounded-lg shadow-md p-6">
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
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Resumen de la reserva */}
                {totalDays > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Resumen de la Reserva</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Días de alquiler:</span>
                                <span className="font-medium">{totalDays} día{totalDays > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Precio por día:</span>
                                <span className="font-medium">${vehicle.price}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                                    <span className="text-2xl font-bold text-stone-900">${totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón de alquilar */}
                <button
                    onClick={handleReservation}
                    disabled={!startDate || !endDate || totalDays <= 0 || isLoading}
                    className="w-full cursor-pointer bg-red-600 text-white py-3 px-4 rounded-md font-semibold text-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Procesando...' : 'Alquilar Vehículo'}
                </button>

                {/* Información adicional */}
                <div className="text-sm text-gray-600 mt-4">
                    <p>• Las reservas se confirman inmediatamente</p>
                </div>
            </div>
        </div>
    );
};

export default FacturationDetail;