import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Images
} from "lucide-react";

const isValidImageUrl = (url) => (
    typeof url === 'string' && /^https?:\/\//i.test(url.trim())
);

const getVehicleGalleryImages = (vehicle) => {
    const rawImages = [
        vehicle.mainImageUrl,
        ...(Array.isArray(vehicle.listImageUrls) ? vehicle.listImageUrls : [])
    ];

    return [...new Set(rawImages.filter(isValidImageUrl))];
};

// Componente para cada tarjeta de vehículo — optimizado móvil 44px, lazy, sin PII
const VehicleCard = ({ vehicle, isFiltered = false, isReserved = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { startDate, endDate } = useDateContext();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Validar si el rango es de un solo día
    const isSameDayRange = startDate && endDate && startDate === endDate;
    const galleryImages = useMemo(() => getVehicleGalleryImages(vehicle), [vehicle]);
    const hasImages = galleryImages.length > 0;
    const hasMultipleImages = galleryImages.length > 1;
    const currentImage = galleryImages[currentImageIndex];

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [vehicle.id]);

    useEffect(() => {
        if (currentImageIndex >= galleryImages.length) {
            setCurrentImageIndex(0);
        }
    }, [currentImageIndex, galleryImages.length]);

    const showPreviousImage = (event) => {
        event.stopPropagation();
        if (!hasMultipleImages) return;

        setCurrentImageIndex((prev) =>
            prev === 0 ? galleryImages.length - 1 : prev - 1
        );
    };

    const showNextImage = (event) => {
        event.stopPropagation();
        if (!hasMultipleImages) return;

        setCurrentImageIndex((prev) =>
            prev === galleryImages.length - 1 ? 0 : prev + 1
        );
    };

    const proceedReservation = () => {
        if (!user) {
            navigate('/login', {
                state: { redirectTo: `/customer/reservation-page/${vehicle.id}` }
            });
        } else {
            navigate(`/customer/reservation-page/${vehicle.id}`);
        }
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

    const isBlocked = isReserved || isSameDayRange;

    // Calcular precio si hay fechas seleccionadas
    const calculation = startDate && endDate && !isSameDayRange
        ? ReservationService.calculateTotalPrice(startDate, endDate, vehicle.pricePerDay ?? vehicle.price)
        : null;

    return (
        <article className={`bg-white/10 backdrop-blur-md border rounded-2xl p-4 shadow-xl transition-colors duration-200 sm:hover:scale-[1.02] sm:hover:bg-white/15 relative
            ${isFiltered ? 'ring-2 ring-white/30' : ''}
            ${isReserved ? 'border-orange-400/50 bg-orange-500/10' : 'border-white/20'}
        `}>
            {/* Badge de reservado */}
            {isReserved && (
                <div className="absolute top-2 right-2 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg z-10">
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    Reservado
                </div>
            )}

            {/* Imagen del vehículo — aspect fijo, lazy, cover */}
            <div className={`group w-full aspect-[4/3] bg-neutral-950/80 rounded-xl mb-4 overflow-hidden relative border border-white/10 shadow-inner ${isReserved ? 'opacity-75' : ''}`}>
                {!hasImages && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-800 to-neutral-950 text-white/35">
                        <Images className="w-10 h-10" aria-hidden="true" />
                        <span className="text-xs font-medium">Sin imagen disponible</span>
                    </div>
                )}

                {hasImages && (
                    <img
                        src={currentImage}
                        alt={`${vehicle.name} — ${vehicle.type}`}
                        loading="lazy"
                        decoding="async"
                        className="relative z-0 w-full h-full object-cover"
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />

                {vehicle.type && (
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-neutral-900 shadow-lg">
                            {vehicle.type}
                        </span>
                    </div>
                )}

                {hasMultipleImages && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                        <Images className="w-3.5 h-3.5" aria-hidden="true" />
                        {currentImageIndex + 1}/{galleryImages.length}
                    </div>
                )}

                {hasMultipleImages && (
                    <>
                        <button
                            type="button"
                            onClick={showPreviousImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 min-h-11 min-w-11 w-11 h-11 flex items-center justify-center text-neutral-900 shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-white"
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={showNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 min-h-11 min-w-11 w-11 h-11 flex items-center justify-center text-neutral-900 shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-white"
                            aria-label="Imagen siguiente"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1" role="tablist" aria-label="Galería">
                            {galleryImages.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    role="tab"
                                    aria-selected={index === currentImageIndex}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                    className="min-h-11 min-w-11 p-3 flex items-center justify-center"
                                    aria-label={`Ver imagen ${index + 1} de ${galleryImages.length}`}
                                >
                                    <span className={`h-1.5 rounded-full transition-all duration-300 ${
                                        index === currentImageIndex
                                            ? 'w-7 bg-white shadow-lg'
                                            : 'w-1.5 bg-white/55'
                                    }`} />
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {isReserved && (
                    <div className="absolute inset-0 bg-orange-500/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <div className="bg-orange-500/90 text-white px-4 py-2 rounded-lg font-semibold">
                            No Disponible
                        </div>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-bold text-white leading-snug">{vehicle.name}</h3>
            <p className="text-white/70 text-sm">{vehicle.type}</p>

            <div className="flex flex-col w-full mt-2">
                <div className="grid grid-cols-2 mb-2 gap-3 text-sm sm:text-base">
                    <p className="flex items-center gap-1.5 text-white/90">
                        <UsersIcon className="w-5 h-5 shrink-0" aria-hidden="true" /> {vehicle.capacity}
                        <span className="text-white/70">personas</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-white/90">
                        <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" /> {vehicle.kilometers} km
                    </p>
                    <p className="flex items-center gap-1.5 text-white/90">
                        <HandCoinsIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
                        <span className="font-bold">${vehicle.pricePerDay}</span> / día
                    </p>
                    {calculation && calculation.days > 0 && (
                        <p className="flex items-center gap-1.5 text-white/90">
                            <DollarSignIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
                            <span className="font-bold">${calculation.totalPrice}</span> /
                            <span className="text-white/70">
                                {calculation.days} día{calculation.days > 1 ? 's' : ''}
                            </span>
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full mt-3">
                <button
                    onClick={handleReservationClick}
                    disabled={isBlocked}
                    aria-disabled={isBlocked}
                    className={`w-full px-4 min-h-11 py-3 rounded-full transition-colors duration-200 shadow-md font-semibold text-base
                        ${isBlocked
                        ? 'bg-gray-500 text-gray-200 cursor-not-allowed opacity-70'
                        : 'bg-white text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 cursor-pointer'
                    }
                    `}
                >
                    {isReserved ? 'No Disponible' : isSameDayRange ? 'Elige fechas distintas' : 'Ver y reservar'}
                </button>
            </div>
        </article>
    );
};

const VehiclesPage = () => {
    const { vehicles, loading, error } = useVehicles();
    const { startDate, endDate } = useDateContext();
    const location = useLocation();
    const [filteredType, setFilteredType] = useState(location.state?.type || 'all');

    // Si viene de Detalle por tipo, pre-filtrar una vez
    useEffect(() => {
        if (location.state?.type && ['Sedan', 'SUV', 'PickUp'].includes(location.state.type)) {
            setFilteredType(location.state.type);
        }
    }, [location.state?.type]);

    // Estados para disponibilidad (endpoint público sin PII)
    const [reservedIds, setReservedIds] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availabilityError, setAvailabilityError] = useState(null);

    // Definir si hay filtros de fecha activos
    const hasDateFilter = Boolean(startDate && endDate);

    // Obtener disponibilidad solo cuando hay rango válido. Sin fechas no se bloquea nada.
    useEffect(() => {
        if (!startDate || !endDate) {
            setReservedIds([]);
            setAvailabilityError(null);
            return;
        }
        // Rango inválido (mismo día o invertido): no llamar API, el botón ya explica
        if (startDate >= endDate) {
            setReservedIds([]);
            return;
        }
        let cancelled = false;
        const fetchAvailability = async () => {
            try {
                setAvailabilityLoading(true);
                setAvailabilityError(null);
                const data = await ReservationService.getAvailability(startDate, endDate);
                if (cancelled) return;
                const ids = [...new Set((Array.isArray(data) ? data : [])
                    .map(r => r.vehicleId)
                    .filter(Boolean))];
                setReservedIds(ids);
            } catch (err) {
                if (cancelled) return;
                setReservedIds([]);
                setAvailabilityError('No se pudo verificar disponibilidad. Mostrando todo como disponible.');
            } finally {
                if (!cancelled) setAvailabilityLoading(false);
            }
        };

        fetchAvailability();
        return () => { cancelled = true; };
    }, [startDate, endDate]);

    // IDs de vehículos reservados (viene del endpoint sin PII)
    const reservedVehicleIds = useMemo(() => reservedIds, [reservedIds]);

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
    if (loading || availabilityLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-4 sm:px-6 pt-24 pb-10 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" aria-hidden="true"></div>
                    <p className="text-white">
                        {availabilityLoading ? 'Verificando disponibilidad...' : 'Cargando vehículos...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-4 sm:px-6 pt-24 pb-10 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white/20 text-white px-6 min-h-11 py-2.5 rounded-lg hover:bg-white/30 transition-colors duration-200"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        // dateStr viene yyyy-MM-dd del input, evitar desfase UTC
        const s = String(dateStr ?? '').slice(0, 10);
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) return `${m[3]}/${m[2]}/${m[1]}`;
        const date = new Date(s);
        if (Number.isNaN(date.getTime())) return s;
        return date.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-800 via-neutral-900 to-black text-white px-4 sm:px-6 pt-24 pb-24 md:pb-10">
            <h1 className="text-2xl font-bold mb-6 text-white">Vehículos Disponibles</h1>

            {/* Filtros */}
            <div className="mb-8">
                {/* Mobile: filtros + fechas apilados */}
                <div className="md:hidden mb-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
                        <div className="overflow-x-auto snap-x snap-mandatory" role="tablist" aria-label="Filtrar por tipo">
                            <div className="flex gap-2 min-w-max">
                                {['all', 'Sedan', 'SUV', 'PickUp'].map((type) => (
                                    <button
                                        key={type}
                                        role="tab"
                                        aria-selected={filteredType === type}
                                        onClick={() => setFilteredType(type)}
                                        className={`snap-start shrink-0 min-h-11 px-5 py-2.5 rounded-3xl text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
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

                    {/* Formulario de fechas debajo en mobile */}
                    <div className="mt-4">
                        <DateForm variant="vehicles" />
                    </div>
                </div>

                {/* Layout normal en desktop */}
                <div className="hidden md:flex flex-wrap items-end gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
                    {['all', 'Sedan', 'SUV', 'PickUp'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilteredType(type)}
                            aria-pressed={filteredType === type}
                            className={`px-6 min-h-11 py-2.5 rounded-3xl text-sm font-semibold transition-colors duration-200 ${
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
                <div className="mb-6 p-4 sm:p-6 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-300 shrink-0" aria-hidden="true" />
                        <p className="text-blue-100 text-sm sm:text-base">
                            Mostrando disponibilidad del {formatDate(startDate)} al {formatDate(endDate)}
                        </p>
                    </div>
                    {availabilityError && (
                        <p className="text-amber-200 text-sm mt-2">{availabilityError}</p>
                    )}
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
                        <Calendar className="w-5 h-5 text-green-400" aria-hidden="true" />
                        Disponibles ({availableVehicles.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                        <AlertCircle className="w-5 h-5 text-orange-400" aria-hidden="true" />
                        No Disponibles ({reservedVehicles.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
