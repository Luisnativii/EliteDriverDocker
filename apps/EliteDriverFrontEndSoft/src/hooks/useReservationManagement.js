import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReservationService from '../services/reservationService';
import { useAuthCheck } from './useVehicles';
import { paymentStatus, reservationStatus, reservationStats as calculateStats, statusLabels, localReservationDate } from '../utils/reservationStatus';

export const useReservationManagement = () => {
  const [allReservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('PAID');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const fetching = useRef(false);
  const { isAuthenticated, hasAdminRole, loading: authLoading } = useAuthCheck();

  const fetchReservations = useCallback(async () => {
    if (fetching.current) return false;
    fetching.current = true;
    try {
      const data = await ReservationService.getAllReservations();
      setReservations(data.map(r => ({
        ...r,
        paymentStatus: paymentStatus(r),
        totalPrice: Number(r.totalPrice) || 0,
        user: {
          ...r.user,
          name: r.user?.name || [r.user?.firstName, r.user?.lastName].filter(Boolean).join(' ') || 'Usuario no disponible',
          email: r.user?.email || '',
          dui: r.user?.dui || 'N/A',
        },
        vehicle: {
          ...r.vehicle,
          name: r.vehicle?.name || 'Vehículo no disponible',
          type: typeof r.vehicle?.vehicleType === 'string' ? r.vehicle.vehicleType : r.vehicle?.vehicleType?.type || r.vehicle?.type || 'N/A',
        },
      })));
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || 'Error al cargar las reservas');
      return false;
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !hasAdminRole) {
      if (!authLoading) setLoading(false);
      return;
    }
    void fetchReservations();
    const refreshVisible = () => { if (document.visibilityState === 'visible') void fetchReservations(); };
    const timer = window.setInterval(refreshVisible, 30000);
    window.addEventListener('focus', refreshVisible);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshVisible); };
  }, [isAuthenticated, hasAdminRole, authLoading, fetchReservations]);

  const reservationsInView = useMemo(() => allReservations.filter(r => paymentStatus(r) === paymentFilter), [allReservations, paymentFilter]);
  const filteredReservations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
    const monthEnd = new Date(today); monthEnd.setMonth(today.getMonth() + 1);
    return reservationsInView.filter(r => {
      if (term && ![r.id, r.user.name, r.user.email, r.user.dui, r.vehicle.name, r.vehicle.brand,
        r.vehicle.model, r.vehicle.type, r.vehicle.id, statusLabels[reservationStatus(r)]]
        .some(value => String(value ?? '').toLowerCase().includes(term))) return false;
      if (filterStatus !== 'all' && reservationStatus(r, now) !== filterStatus) return false;
      if (filterVehicleType !== 'all' && r.vehicle.type !== filterVehicleType) return false;
      const start = localReservationDate(r.startDate);
      const end = localReservationDate(r.endDate, true);
      if (dateFilter === 'today') return start <= now && end >= today;
      if (dateFilter === 'week') return start <= weekEnd && end >= today;
      if (dateFilter === 'month') return start <= monthEnd && end >= today;
      if (dateFilter === 'past') return end < today;
      return true;
    }).sort((a, b) => {
      const value = r => sortBy === 'userName' ? r.user.name.toLowerCase()
        : sortBy === 'vehicleName' ? r.vehicle.name.toLowerCase()
        : sortBy === 'totalPrice' ? r.totalPrice : sortBy === 'id' ? r.id : localReservationDate(r[sortBy] || r.startDate).getTime();
      const av = value(a), bv = value(b);
      return (av < bv ? -1 : av > bv ? 1 : 0) * (sortOrder === 'asc' ? 1 : -1);
    });
  }, [reservationsInView, searchTerm, filterStatus, filterVehicleType, dateFilter, sortBy, sortOrder]);

  const uniqueVehicleTypes = useMemo(() => [...new Set(reservationsInView.map(r => r.vehicle.type))], [reservationsInView]);
  const uniqueStatuses = useMemo(() => [...new Set(reservationsInView.map(r => reservationStatus(r)))], [reservationsInView]);
  const reservationStats = useMemo(() => calculateStats(allReservations), [allReservations]);
  const changePaymentFilter = value => { setPaymentFilter(value); setFilterStatus('all'); setFilterVehicleType('all'); };

  const handleConfirmCancel = async () => {
    if (!reservationToCancel) return;
    setOperationLoading(true);
    try {
      await ReservationService.deleteReservation(reservationToCancel.id);
      setReservations(prev => prev.filter(r => r.id !== reservationToCancel.id));
      setShowConfirmDialog(false);
      setReservationToCancel(null);
    } catch (err) {
      await fetchReservations();
      setError(err.message || 'Error al cancelar la reserva');
    } finally { setOperationLoading(false); }
  };
  const initiateCancel = reservation => { setReservationToCancel(reservation); setShowConfirmDialog(true); };
  const handleCancelConfirm = () => { setShowConfirmDialog(false); setReservationToCancel(null); };
  const formatDate = date => localReservationDate(date).toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatPrice = price => new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(price || 0);
  const getStatusLabel = status => statusLabels[status] || status;
  const getStatusColor = status => ({
    Activa: 'text-green-300 bg-green-500/20', Próxima: 'text-yellow-300 bg-yellow-500/20',
    Completada: 'text-blue-300 bg-blue-500/20', 'Pendiente de pago': 'text-amber-300 bg-amber-500/20',
    'Prueba aprobada': 'text-purple-300 bg-purple-500/20',
  })[status] || 'text-gray-300 bg-gray-500/20';

  return {
    loading, error, authLoading, isAuthenticated, hasAdminRole, operationLoading,
    reservations: filteredReservations, searchTerm, filterStatus, filterVehicleType, dateFilter,
    sortBy, sortOrder, showConfirmDialog, reservationToCancel, paymentFilter,
    viewTotal: reservationsInView.length, uniqueVehicleTypes, uniqueStatuses, reservationStats,
    setSearchTerm, setFilterStatus, setFilterVehicleType, setDateFilter, setSortBy, setSortOrder,
    setPaymentFilter: changePaymentFilter, initiateCancel, handleConfirmCancel, handleCancelConfirm,
    handleRefresh: fetchReservations,
    getConfirmationMessage: () => reservationToCancel ? `¿Deseas cancelar la reserva pendiente de ${reservationToCancel.user.name} para ${reservationToCancel.vehicle.name}?` : '',
    formatDate, formatPrice, getStatusColor, getStatusLabel, setError,
  };
};
