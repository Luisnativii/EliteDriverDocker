import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useReservationManagement } from '../../hooks/useReservationManagement';
import ReservationDetailModal from '../reservation/ReservationDetailModal';

const locales = {
    es: es,
};

// Configuración del localizador para la fecha (usando date-fns)
const localizer = dateFnsLocalizer({
    format: (date, formatStr, culture, options) =>
        format(date, formatStr, { ...options, locale: es }),
    parse: (value, formatStr, culture, options) =>
        parse(value, formatStr, new Date(), { ...options, locale: es }),
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1, locale: es }),
    getDay,
    locales: { es },
});

/**
 * Componente del calendario de reservas.
 * Muestra un calendario interactivo con las reservas del vehículo, con funcionalidad para ver detalles y navegar por fechas.
 */


const ReservationCalendar = () => {
    const { reservations, loading, error } = useReservationManagement();
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month');

    const events = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return reservations.map(r => {
            const startDate = new Date(r.startDate);
            const endDate = new Date(r.endDate);
            endDate.setDate(endDate.getDate() + 1); // 👈 corregimos el rango para react-big-calendar

            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

            let status = 'upcoming';
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (endDateOnly < today) {
                status = 'completed';
            } else if (startDateOnly <= today && endDateOnly >= today) {
                status = 'active';
            }

            return {
                id: r.id,
                title: `${r.vehicle?.name || 'Vehículo reservado'} — ${r.user?.name || ''} `,
                start: startDate,
                end: endDate,
                allDay: true,
                reservation: r,
                status: status,
            };
        });
    }, [reservations]);

    /**
     * Componente personalizado para los eventos en el calendario.
     * Muestra cada evento con su estilo y un ícono basado en su estado (activo, completado o próximo).
     */

    const EventComponent = ({ event }) => {
        const getEventStyles = (status) => {
            switch (status) {
                case 'active':
                    return 'bg-gradient-to-r from-green-800/80 to-emerald-700/80 border-green-300/50';
                case 'completed':
                    return 'bg-gradient-to-r from-blue-800/80 to-cyan-700/80 border-blue-300/50';
                case 'upcoming':
                    return 'bg-gradient-to-r from-yellow-500/80 to-amber-400/80 border-yellow-300/50';
                default:
                    return 'bg-gradient-to-r from-gray-500/80 to-slate-500/80 border-gray-400/50';
            }
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case 'active':
                    return '🟢';
                case 'completed':
                    return '🔵';
                case 'upcoming':
                    return '🟡';
                default:
                    return '⚪';
            }
        };

        return (
            <div className={`${getEventStyles(event.status)} backdrop-blur-sm rounded-md px-2 py-1 text-white shadow-lg border`}>
                <span className="text-xs font-medium block truncate">
                    {getStatusIcon(event.status)} {event.title}
                </span>
            </div>
        );
    };

    // Componente personalizado para la barra de herramientas
    const CustomToolbar = ({ label, onNavigate, onView }) => (
        <div className="flex items-center justify-between mb-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-600/20 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">{label}</h2>
            </div>

            <div className="flex items-center space-x-2">
                {/* Botones de navegación */}
                <button
                    onClick={() => onNavigate('PREV')}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/20"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={() => onNavigate('TODAY')}
                    className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/20 text-sm font-medium"
                >
                    Hoy
                </button>

                <button
                    onClick={() => onNavigate('NEXT')}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/20"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Selectores de vista */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onView('month')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${currentView === 'month'
                        ? 'bg-red-500/30 text-red-300 border-red-400/50'
                        : 'text-white/70 hover:text-white hover:bg-white/10 border-white/20'
                        }`}
                >
                    Mes
                </button>
                <button
                    onClick={() => onView('week')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${currentView === 'week'
                        ? 'bg-red-500/30 text-red-300 border-red-400/50'
                        : 'text-white/70 hover:text-white hover:bg-white/10 border-white/20'
                        }`}
                >
                    Semana
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                <span className="ml-3 text-white">Cargando calendario...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-400/20 rounded-xl">
                <p className="text-red-400">Error al cargar las reservaciones: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm">Total Reservaciones</p>
                            <p className="text-2xl font-bold text-white">{reservations.length}</p>
                        </div>
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <CalendarDays className="w-6 h-6 text-red-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm">🟢 Activas</p>
                            <p className="text-2xl font-bold text-green-400">
                                {events.filter(e => e.status === 'active').length}
                            </p>
                        </div>
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <CalendarDays className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm">🔵 Completadas</p>
                            <p className="text-2xl font-bold text-blue-400">
                                {events.filter(e => e.status === 'completed').length}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <CalendarDays className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm">🟡 Próximas</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                {events.filter(e => e.status === 'upcoming').length}
                            </p>
                        </div>
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <CalendarDays className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>


            {/* Calendario principal */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                <style jsx>{`
                    .rbc-calendar {
                        background: transparent !important;
                        color: white !important;
                    }
                    
                    .rbc-header {
                        background: rgba(255, 255, 255, 0.05) !important;
                        color: white !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
                        padding: 10px 5px !important;
                        font-weight: 600 !important;
                    }
                    
                    .rbc-date-cell {
                        color: rgba(255, 255, 255, 0.8) !important;
                        border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                        padding: 8px !important;
                        background: rgba(255, 255, 255, 0.02) !important;
                    }
                    
                    .rbc-date-cell:hover {
                        background: rgba(255, 255, 255, 0.05) !important;
                    }
                    
                    .rbc-today {
                        background: rgba(239, 68, 68, 0.15) !important;
                        border: 1px solid rgba(239, 68, 68, 0.3) !important;
                    }
                    
                    .rbc-off-range-bg {
                        background: rgba(255, 255, 255, 0.02) !important;
                        color: rgba(255, 255, 255, 0.3) !important;
                    }
                    
                    .rbc-month-view {
                        border: 1px solid rgba(255, 255, 255, 0.1) !important;
                        border-radius: 8px !important;
                        overflow: hidden !important;
                    }
                    
                    .rbc-event {
                        background: transparent !important;
                        border: none !important;
                        border-radius: 6px !important;
                        padding: 2px !important;
                    }
                    
                    .rbc-event:hover {
                        transform: scale(1.02) !important;
                        transition: transform 0.2s ease !important;
                    }
                    
                    .rbc-show-more {
                        background: rgba(139, 92, 246, 0.2) !important;
                        color: rgb(196, 181, 253) !important;
                        border: 1px solid rgba(139, 92, 246, 0.3) !important;
                        border-radius: 4px !important;
                        font-size: 11px !important;
                        padding: 2px 6px !important;
                    }
                    
                    .rbc-popup {
                        background: rgba(15, 23, 42, 0.95) !important;
                        backdrop-filter: blur(10px) !important;
                        border: 1px solid rgba(255, 255, 255, 0.2) !important;
                        border-radius: 12px !important;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                    }
                    
                    .rbc-popup-header {
                        background: rgba(255, 255, 255, 0.1) !important;
                        color: white !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
                        padding: 8px 12px !important;
                        font-weight: 600 !important;
                    }
                `}</style>

                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={['month', 'week']}
                    view={currentView}
                    onView={setCurrentView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    popup={true}
                    style={{ height: 800, padding: '2px' }}
                    messages={{
                        next: 'Siguiente',
                        previous: 'Anterior',
                        today: 'Hoy',
                        month: 'Mes',
                        week: 'Semana',
                        showMore: total => `+${total} más`,
                    }}
                    onSelectEvent={(event) => {
                        setSelectedReservation(event.reservation);
                        setModalOpen(true);
                    }}
                    components={{
                        event: EventComponent,
                        toolbar: CustomToolbar,
                    }}
                />
            </div>

            {/* Modal de detalles */}
            {selectedReservation && (
                <ReservationDetailModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    reservation={selectedReservation}
                    formatDate={(date) => new Date(date).toLocaleDateString('es-ES')}
                    formatPrice={(price) => `$${price?.toLocaleString('es-SV')}`}
                />
            )}
        </div>
    );
};

export default ReservationCalendar;