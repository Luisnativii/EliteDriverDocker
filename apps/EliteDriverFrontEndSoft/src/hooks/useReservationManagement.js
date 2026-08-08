// hooks/useReservationManagement.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import ReservationService from '../services/reservationService';
import { useAuthCheck } from './useVehicles';

export const useReservationManagement = () => {
  // Estados principales
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('startDate'); // startDate, endDate, createdAt
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  // Estados de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);

  // Auth check
  const { isAuthenticated, hasAdminRole, loading: authLoading } = useAuthCheck();

  // Función para obtener todas las reservas
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar getAllReservations si existe en el servicio
      const reservationsData = await ReservationService.getAllReservations();

      // Transformar datos si es necesario
      const transformedReservations = reservationsData.map(reservation => ({
        id: reservation.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        totalPrice: reservation.totalPrice || 0,
        status: reservation.status || 'confirmado',
        createdAt: reservation.createdAt || new Date().toISOString(),
        user: {
          id: reservation.user?.id || reservation.userId,
          name: reservation.user?.name || 'Usuario no disponible',
          email: reservation.user?.email || 'email@no-disponible.com',
          dui: reservation.user?.dui || 'N/A'
        },
        vehicle: {
          id: reservation.vehicle?.id || reservation.vehicleId,
          name: reservation.vehicle?.name || 'Vehículo no disponible',
          brand: reservation.vehicle?.brand || 'N/A',
          model: reservation.vehicle?.model || 'N/A',
          type: reservation.vehicle?.vehicleType?.type || reservation.vehicle?.type || reservation.vehicleType || 'N/A',
          capacity: reservation.vehicle?.capacity || 0
        }
      }));

      setReservations(transformedReservations);

    } catch (err) {
      setError(err.message || 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar reservas al montar el componente
  useEffect(() => {
    if (isAuthenticated && hasAdminRole) {
      fetchReservations();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, hasAdminRole, authLoading, fetchReservations]);

  // Función para filtrar reservas
  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reservation =>
        reservation.user.name.toLowerCase().includes(term) ||
        reservation.user.email.toLowerCase().includes(term) ||
        reservation.user.dui.toLowerCase().includes(term) ||
        reservation.vehicle.name.toLowerCase().includes(term) ||
        reservation.vehicle.brand.toLowerCase().includes(term) ||
        reservation.vehicle.model.toLowerCase().includes(term) ||
        reservation.status.toLowerCase().includes(term) ||
        reservation.vehicle.type.toLowerCase().includes(term) ||
        reservation.id.toString().includes(term) ||
        reservation.vehicle.id.toString().includes(term)
      );
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reservation => {
        const now = new Date();
        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);

        const derivedStatus = start > now
          ? 'próxima'
          : (start <= now && end >= now ? 'activa' : 'completada');

        return derivedStatus === filterStatus;
      });
    }


    // Filtro por tipo de vehículo
    if (filterVehicleType !== 'all') {
      filtered = filtered.filter(reservation =>
        reservation.vehicle.type.toLowerCase() === filterVehicleType.toLowerCase()
      );
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(reservation => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);

        switch (dateFilter) {
          case 'today':
            return startDate <= now && endDate >= today;
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            return startDate <= weekFromNow && endDate >= today;
          case 'month':
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(today.getMonth() + 1);
            return startDate <= monthFromNow && endDate >= today;
          case 'past':
            return endDate < today;
          default:
            return true;
        }
      });
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'endDate':
          aValue = new Date(a.endDate);
          bValue = new Date(b.endDate);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'totalPrice':
          aValue = a.totalPrice;
          bValue = b.totalPrice;
          break;
        case 'userName':
          aValue = a.user.name.toLowerCase();
          bValue = b.user.name.toLowerCase();
          break;
        case 'vehicleName':
          aValue = a.vehicle.name.toLowerCase();
          bValue = b.vehicle.name.toLowerCase();
          break;
        default:
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [reservations, searchTerm, filterStatus, filterVehicleType, dateFilter, sortBy, sortOrder]);

  // Obtener tipos únicos de vehículos
  const uniqueVehicleTypes = useMemo(() => {
    const types = reservations.map(r => r.vehicle.type).filter(Boolean);
    return [...new Set(types)];
  }, [reservations]);

  // Obtener estados únicos
  const uniqueStatuses = useMemo(() => {
    const now = new Date();
    const statuses = reservations.map(r => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      if (start > now) return 'próxima';
      if (start <= now && end >= now) return 'activa';
      if (end < now) return 'completada';
      return 'desconocida';
    });
    return [...new Set(statuses)];
  }, [reservations]);


  // Estadísticas
  const reservationStats = useMemo(() => {
    const total = reservations.length;
    const active = reservations.filter(r => {
      const now = new Date();
      const startDate = new Date(r.startDate);
      const endDate = new Date(r.endDate);
      return startDate <= now && endDate >= now;
    }).length;

    const upcoming = reservations.filter(r => {
      const now = new Date();
      const startDate = new Date(r.startDate);
      return startDate > now;
    }).length;

    const completed = reservations.filter(r => {
      const now = new Date();
      const endDate = new Date(r.endDate);
      return endDate < now;
    }).length;

    const totalRevenue = reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    return {
      total,
      active,
      upcoming,
      completed,
      totalRevenue
    };
  }, [reservations]);

  // Función para cancelar reserva
  const handleCancelReservation = useCallback(async (reservationId) => {
    try {
      setOperationLoading(true);
      await ReservationService.deleteReservation(reservationId);

      // Actualizar la lista local
      setReservations(prev => prev.filter(r => r.id !== reservationId));

      // Cerrar dialog
      setShowConfirmDialog(false);
      setReservationToCancel(null);

    } catch (err) {
      setError(err.message || 'Error al cancelar la reserva');
    } finally {
      setOperationLoading(false);
    }
  }, []);

  // Función para iniciar cancelación
  const initiateCancel = useCallback((reservation) => {
    setReservationToCancel(reservation);
    setShowConfirmDialog(true);
  }, []);

  // Función para confirmar cancelación
  const handleConfirmCancel = useCallback(() => {
    if (reservationToCancel) {
      handleCancelReservation(reservationToCancel.id);
    }
  }, [reservationToCancel, handleCancelReservation]);

  // Función para cancelar confirmación
  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(false);
    setReservationToCancel(null);
  }, []);

  // Función para refrescar datos
  const handleRefresh = useCallback(() => {
    fetchReservations();
  }, [fetchReservations]);

  

  // Función para obtener mensaje de confirmación
  const getConfirmationMessage = useCallback(() => {
    if (!reservationToCancel) return '';

    return `¿Estás seguro de que deseas cancelar la reserva de ${reservationToCancel.user.name} para el vehículo ${reservationToCancel.vehicle.name}?`;
  }, [reservationToCancel]);

  // Función para formatear fecha
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Función para formatear precio
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  }, []);

  // Función para obtener color del estado
  const getStatusColor = useCallback((status) => {
    const colors = {
      'Próxima': 'text-yellow-400 bg-yellow-500/20',
      'Activa': 'text-green-400 bg-green-500/20',
      'Completada': 'text-blue-400 bg-blue-500/20',

    };
    return colors[status] || 'text-gray-400 bg-gray-500/20';
  }, []);

  // Función para obtener etiqueta del estado
  const getStatusLabel = useCallback((status) => {
    const labels = {
      'activa': 'Activa',
      'próxima': 'Próxima',
      'completada': 'Completada',
    };
    return labels[status] || 'Desconocido';
  }, []);

  return {
    // Estados
    loading,
    error,
    authLoading,
    isAuthenticated,
    hasAdminRole,
    operationLoading,
    reservations: filteredReservations,
    searchTerm,
    filterStatus,
    filterVehicleType,
    dateFilter,
    sortBy,
    sortOrder,
    showConfirmDialog,
    reservationToCancel,

    // Datos computados
    uniqueVehicleTypes,
    uniqueStatuses,
    reservationStats,

    // Handlers
    setSearchTerm,
    setFilterStatus,
    setFilterVehicleType,
    setDateFilter,
    setSortBy,
    setSortOrder,
    initiateCancel,
    handleConfirmCancel,
    handleCancelConfirm,
    handleRefresh,
    getConfirmationMessage,
    formatDate,
    formatPrice,
    getStatusColor,
    getStatusLabel,
    setError,
  };
};