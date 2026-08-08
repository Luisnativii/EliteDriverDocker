import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../../hooks/useVehicles';
import { useDateContext } from '../../context/DateContext';
import DateForm from '../../components/forms/DateForm';
import ReservationService from '../../services/reservationService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
    DollarSignIcon,
    HandCoinsIcon,
    MapPin,
    UsersIcon,
    Calendar,
    AlertCircle
} from "lucide-react";

const formatDateISO = (date) => new Date(date).toISOString().split('T')[0];

// Componente para cada tarjeta de vehículo
const VehicleCard = ({ vehicle, isFiltered = false, isReserved = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { startDate, endDate } = useDateContext();

    // Validar si el rango es de un solo día
    const isSameDayRange = startDate && endDate && startDate === endDate;

    const proceedReservation = () => {
        if (!user) {
            navigate('/login', {
                state: { redirectTo: `/customer/reservation-page/${vehicle.id}` }
            });
        } else {
            navigate(`/customer/reservation-page/${vehicle.id}`);
        }
    };

    // Detecta MIME y reconstruye el src base64
    const getBase64ImageSrc = (base64) => {
        if (!base64) return "/images/vehicle-placeholder.jpg";

        const clean = base64.trim().replace(/\\n/g, "").replace(/\s/g, "");

        const mimeType =
            clean.startsWith("/") ? "image/jpeg" :
                clean.startsWith("iVBOR") ? "image/png" :
                    clean.startsWith("UklGR") ? "image/webp" :
                        "image/jpeg";

        return `data:${mimeType};base64,${clean}`;
    };

    const handleReservationClick = () => {
        // Bloquear si está reservado
        if (isReserved) {
            toast.error('Este vehículo está reservado para las fechas seleccionadas.');
            return;
        }

        // Bloquear si la fecha de inicio y fin son iguales
        if (isSameDayRange) {
            toast.error('No se puede alquilar con la misma fecha de inicio y fin.');
            return;
        }

        proceedReservation();
    };

    // Calcular precio si hay fechas seleccionadas
    const calculation = startDate && endDate && !isSameDayRange
        ? ReservationService.calculateTotalPrice(startDate, endDate, vehicle.price)
        : null;

    return (
        <div className={`bg-white/10 backdrop-blur-md border rounded-2xl p-4 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 relative
            ${isFiltered ? 'ring-2 ring-white/30' : ''}
            ${isReserved ? 'border-orange-400/50 bg-orange-500/10' : 'border-white/20'}
        `}>
            {/* Badge de reservado */}
            {isReserved && (
                <div className="absolute top-2 right-2 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg z-10">
                    <Calendar className="w-3 h-3" />
                    Reservado
                </div>
            )}

            {/* IMAGEN BASE64 */}
            <div className={`w-full h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden relative ${isReserved ? 'opacity-75' : ''}`}>
                <img
                    src={getBase64ImageSrc(vehicle.mainImageBase64)}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "/images/vehicle-placeholder.jpg"}
                />
                {isReserved && (
                    <div className="absolute inset-0 bg-orange-500/20 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-orange-500/90 text-white px-4 py-2 rounded-lg font-semibold">
                            No Disponible
                        </div>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-bold text-white">{vehicle.name}</h3>
            <p className="text-white/70">{vehicle.type}</p>

            <div className="flex flex-col w-full">
                <div className="grid grid-cols-2 mb-2 gap-4">
                    <p className="flex gap-1 text-white/90">
                        <UsersIcon className="w-5 h-5"/> {vehicle.capacity}
                        <span className="text-white/70">personas</span>
                    </p>
                    <p className="flex gap-1 text-white/90">
                        <MapPin className="w-5 h-5"/> {vehicle.kilometers} km
                    </p>
                    <p className="flex gap-1 text-white/90">
                        <HandCoinsIcon className="w-5 h-5"/>
                        <span className="font-bold">${vehicle.pricePerDay}</span> / día
                    </p>
                    {calculation && calculation.days > 0 && (
                        <p className="flex gap-1 text-white/90">
                            <DollarSignIcon className="w-5 h-5"/>
                            <span className="font-bold">${calculation.totalPrice}</span> /
                            <span className="text-white/70">
                                {calculation.days} día{calculation.days > 1 ? 's' : ''}
                            </span>
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full my-2">
                <button
                    onClick={handleReservationClick}
                    disabled={isReserved}
                    className={`w-full px-4 py-2 rounded-full transition-all duration-300 shadow-md font-semibold
                        ${isReserved
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-60'
                        : isSameDayRange
                            ? 'bg-gradient-to-r from-black to-neutral-900 text-white opacity-60 cursor-not-allowed'
                            : 'bg-gradient-to-r from-black to-neutral-900 text-white hover:from-neutral-600 hover:to-neutral-800 cursor-pointer'
                    }
                    `}
                >
                    {isReserved ? 'No Disponible' : 'Ver más'}
                </button>
            </div>
        </div>
    );
};

const VehiclesPage = () => {
    const { vehicles, loading, error } = useVehicles();
    const { startDate, endDate } = useDateContext();
    const [filteredType, setFilteredType] = useState('all');

    // Estados para reservaciones (igual que useVehicleManagement)
    const [reservations, setReservations] = useState([]);
    const [reservationsLoading, setReservationsLoading] = useState(false);

    // Definir si hay filtros de fecha activos
    const hasDateFilter = startDate && endDate;

    // Obtener TODAS las reservaciones una sola vez (igual que useVehicleManagement)
    useEffect(() => {
        const fetchAllReservations = async () => {
            try {
                setReservationsLoading(true);

                // Usar getAllReservations igual que en useVehicleManagement
                const reservationsData = await ReservationService.getAllReservations();

                // Transformar datos igual que en useVehicleManagement
                const transformedReservations = reservationsData.map(reservation => ({
                    id: reservation.id,
                    startDate: reservation.startDate,
                    endDate: reservation.endDate,
                    status: reservation.status || 'active',
                    vehicle: {
                        id: reservation.vehicle?.id || reservation.vehicleId,
                        name: reservation.vehicle?.name || 'Vehículo no disponible',
                    }
                }));

                setReservations(transformedReservations);

            } catch (err) {
                console.error('❌ Error al cargar reservas:', err);
                setReservations([]);
            } finally {
                setReservationsLoading(false);
            }
        };

        fetchAllReservations();
    }, []);

    // Filtrar reservas por el rango de fechas (igual que useVehicleManagement)
    const reservationsInDateRange = useMemo(() => {
        if (!startDate || !endDate || reservations.length === 0) {
            return [];
        }

        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);

        // Establecer horas para comparación correcta
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        const filteredReservations = reservations.filter(reservation => {
            // Solo considerar reservas activas/confirmadas
            if (reservation.status?.toLowerCase() !== 'active' &&
                reservation.status?.toLowerCase() !== 'confirmado') {
                return false;
            }

            const resStartDate = new Date(reservation.startDate);
            const resEndDate = new Date(reservation.endDate);

            // La reserva está activa en el rango si:
            // - Su fecha de inicio es <= toDate Y su fecha de fin es >= fromDate
            return resStartDate <= toDate && resEndDate >= fromDate;
        });

        return filteredReservations;
    }, [reservations, startDate, endDate]);

    // Obtener IDs de vehículos reservados (igual que useVehicleManagement)
    const reservedVehicleIds = useMemo(() => {
        const ids = reservationsInDateRange
            .map(reservation => reservation.vehicle.id)
            .filter(Boolean);

        // Eliminar duplicados
        return [...new Set(ids)];
    }, [reservationsInDateRange]);

    // Filtrar vehículos disponibles
    let filteredVehicles = vehicles.filter(vehicle => {
        // Solo mostrar vehículos con estado "maintenanceCompleted" o sin estado definido
        const vehicleStatus = vehicle.status || 'maintenanceCompleted';
        const isMaintenanceCompleted = vehicleStatus === 'maintenanceCompleted';

        // Filtrar por tipo si no es 'all'
        const typeMatch = filteredType === 'all' || vehicle.type === filteredType;

        return isMaintenanceCompleted && typeMatch;
    });

    // Separar vehículos disponibles y reservados
    const availableVehicles = filteredVehicles.filter(v => !reservedVehicleIds.includes(v.id));
    const reservedVehicles = filteredVehicles.filter(v => reservedVehicleIds.includes(v.id));

    // Manejo de estados de carga y error
    if (loading || reservationsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-6 py-25 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">
                        {reservationsLoading ? 'Verificando disponibilidad...' : 'Cargando vehículos...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-6 py-25 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-all duration-300"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-800 via-neutral-900 to-black text-white px-6 py-25">
            <h1 className="text-2xl font-bold mb-6 text-white">Vehículos Disponibles</h1>

            {/* Filtros */}
            <div className="mb-8">
                {/* Carrusel en mobile con scroll snap */}
                <div className="md:hidden mb-4">
                    <div className="bg-white/10 hide-scrollbar backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
                        <div className="overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                            <div className="flex gap-3">
                                {['all', 'Sedan', 'SUV', 'PickUp'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilteredType(type)}
                                        className={`snap-start flex-shrink-0 w-[calc(33.33%-0.5rem)] px-4 py-2 rounded-3xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                                            filteredType === type
                                                ? 'bg-white text-neutral-900 shadow-md'
                                                : 'bg-white/10 text-white active:bg-white/20 border border-white/30'
                                        }`}
                                    >
                                        {type === 'all' ? 'Todos' : type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Formulario de fechas debajo del carrusel en mobile */}
                    <div className="mt-4">
                        <DateForm variant="vehicles" />
                    </div>
                </div>

                {/* Layout normal en desktop */}
                <div className="hidden md:flex flex-wrap gap-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
                    {['all', 'Sedan', 'SUV', 'PickUp'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilteredType(type)}
                            className={`px-6 py-2 rounded-3xl text-sm font-semibold transition-all duration-300 ${
                                filteredType === type
                                    ? 'bg-white text-neutral-900 shadow-md'
                                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                            }`}
                        >
                            {type === 'all' ? 'Todos' : type}
                        </button>
                    ))}

                    {/* Formulario de fechas al final en desktop */}
                    <div className="ml-auto">
                        <DateForm variant="vehicles" />
                    </div>
                </div>
            </div>

            {/* Mostrar información de filtros activos */}
            {hasDateFilter && (
                <div className="mb-6 p-6 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-300" />
                        <p className="text-blue-100">
                            📅 Mostrando disponibilidad del {formatDate(startDate)} al {formatDate(endDate)}
                        </p>
                    </div>
                    {reservedVehicles.length > 0 && (
                        <p className="text-blue-200 text-sm mt-2">
                            {reservedVehicles.length} vehículo{reservedVehicles.length > 1 ? 's' : ''} reservado{reservedVehicles.length > 1 ? 's' : ''} para estas fechas
                        </p>
                    )}
                </div>
            )}

            {/* Mensaje cuando no hay vehículos disponibles */}
            {filteredVehicles.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            No hay vehículos disponibles
                        </h3>
                        <p className="text-white/70 mb-4">
                            {hasDateFilter
                                ? 'No hay vehículos disponibles para las fechas seleccionadas.'
                                : 'Actualmente no hay vehículos disponibles para alquilar.'
                            }
                        </p>
                        {hasDateFilter && (
                            <p className="text-white/60 text-sm">
                                Intenta seleccionar otras fechas o contacta con nosotros para más opciones.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Grid de vehículos disponibles */}
            {availableVehicles.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-400" />
                        Disponibles ({availableVehicles.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {availableVehicles.map(vehicle => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={vehicle}
                                isFiltered={hasDateFilter}
                                isReserved={false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Grid de vehículos reservados (solo si hay fechas seleccionadas) */}
            {hasDateFilter && reservedVehicles.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        No Disponibles ({reservedVehicles.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {reservedVehicles.map(vehicle => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={vehicle}
                                isFiltered={hasDateFilter}
                                isReserved={true}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehiclesPage;