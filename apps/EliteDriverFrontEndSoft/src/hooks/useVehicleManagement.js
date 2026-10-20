import { useState, useCallback, useEffect, useMemo } from 'react';
import { useVehicles, useVehicleOperations } from './useVehicles';
import ReservationService from '../services/reservationService';
import { rentalToday } from '../utils/rentalDates.js';
import { vehicleAvailabilityStatus } from '../utils/vehicleAvailability.js';

export const useVehicleManagement = () => {
  const { vehicles, loading, error, refetch } = useVehicles();
  const { createVehicle, updateVehicle, isLoading: operationLoading } = useVehicleOperations();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reservationDateFrom, setReservationDateFrom] = useState(rentalToday);
  const [reservationDateTo, setReservationDateTo] = useState(rentalToday);
  const [occupiedIds, setOccupiedIds] = useState([]);
  const [availabilityError, setAvailabilityError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!reservationDateFrom || !reservationDateTo || reservationDateFrom > reservationDateTo) {
      setAvailabilityError('Selecciona un rango de fechas válido.'); setOccupiedIds([]); return;
    }
    ReservationService.getAvailability(reservationDateFrom, reservationDateTo).then(data => {
      if (!cancelled) { setOccupiedIds(data.filter(r => r.status !== 'OUT_OF_SERVICE').map(r => r.vehicleId)); setAvailabilityError(''); }
    }).catch(err => { if (!cancelled) setAvailabilityError(err.message || 'No se pudo comprobar la disponibilidad.'); });
    return () => { cancelled = true; };
  }, [reservationDateFrom, reservationDateTo, revision]);

  const getEffectiveVehicleStatus = useCallback(v => vehicleAvailabilityStatus(v, reservationDateFrom, reservationDateTo, occupiedIds), [reservationDateFrom, reservationDateTo, occupiedIds]);
  const filteredVehicles = useMemo(() => vehicles.filter(v =>
    [v.name, v.brand, v.model].join(' ').toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || v.type?.toLowerCase() === filterType.toLowerCase()) &&
    (statusFilter === 'all' || getEffectiveVehicleStatus(v) === statusFilter)), [vehicles, searchTerm, filterType, statusFilter, getEffectiveVehicleStatus]);
  const statusCounts = useMemo(() => {
    const counts = { total: vehicles.length, active: 0, inactive: 0, outOfService: 0, reserved: 0 };
    vehicles.forEach(v => counts[getEffectiveVehicleStatus(v)]++); return counts;
  }, [vehicles, getEffectiveVehicleStatus]);
  const handleCloseForm = useCallback(() => { setShowForm(false); setEditingVehicle(null); }, []);
  const handleRefresh = useCallback(async () => { await refetch(); setRevision(n => n + 1); }, [refetch]);
  const afterSave = async () => { handleCloseForm(); await handleRefresh(); };
  return { vehicles, loading, error: error || availabilityError, operationLoading, showForm, editingVehicle,
    searchTerm, setSearchTerm, filterType, setFilterType, statusFilter, setStatusFilter, reservationDateFrom, reservationDateTo,
    setReservationDateFrom, setReservationDateTo, filteredVehicles, statusCounts, getEffectiveVehicleStatus,
    uniqueTypes: [...new Set(vehicles.map(v => v.type).filter(Boolean))], handleCloseForm, handleRefresh,
    handleAddVehicle: () => { setEditingVehicle(null); setShowForm(true); },
    handleEditVehicle: v => { setEditingVehicle(v); setShowForm(true); },
    handleCreateSubmit: data => createVehicle(data, afterSave),
    handleUpdateSubmit: (id, data) => updateVehicle(id, data, afterSave) };
};
