import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getSuppliers } from '../services/adminService';
import { matchesOwnership } from '../utils/customerManagement.js';
import { useVehicles, useVehicleOperations } from './useVehicles';
import ReservationService from '../services/reservationService';
import { rentalToday } from '../utils/rentalDates.js';
import { vehicleAvailabilityStatus } from '../utils/vehicleAvailability.js';

export const useVehicleManagement = () => {
  const { vehicles, loading, error, refetch } = useVehicles();
  const { createVehicle, updateVehicle, isLoading: operationLoading } = useVehicleOperations();
  const location = useLocation();
  const [ownershipFilter, setOwnershipFilter] = useState(location.state?.supplierFilter || 'all');
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [suppliersError, setSuppliersError] = useState('');
  const fetchSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    try { setSuppliers(await getSuppliers()); setSuppliersError(''); }
    catch (err) { setSuppliersError(err.message); }
    finally { setSuppliersLoading(false); }
  }, []);
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);
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
    matchesOwnership(v, ownershipFilter) &&
    (statusFilter === 'all' || getEffectiveVehicleStatus(v) === statusFilter)), [vehicles, searchTerm, filterType, statusFilter, getEffectiveVehicleStatus, ownershipFilter]);
  const statusCounts = useMemo(() => {
    const counts = { total: vehicles.length, active: 0, inactive: 0, outOfService: 0, reserved: 0 };
    vehicles.forEach(v => counts[getEffectiveVehicleStatus(v)]++); return counts;
  }, [vehicles, getEffectiveVehicleStatus]);
  const handleCloseForm = useCallback(() => { setShowForm(false); setEditingVehicle(null); }, []);
  const handleRefresh = useCallback(async () => { await Promise.all([refetch(),fetchSuppliers()]); setRevision(n => n + 1); }, [refetch,fetchSuppliers]);
  const afterSave = async () => { handleCloseForm(); await handleRefresh(); };
  return { ownershipFilter, setOwnershipFilter, suppliers, suppliersLoading, suppliersError, vehicles, loading, error: error || availabilityError, operationLoading, showForm, editingVehicle,
    searchTerm, setSearchTerm, filterType, setFilterType, statusFilter, setStatusFilter, reservationDateFrom, reservationDateTo,
    setReservationDateFrom, setReservationDateTo, filteredVehicles, statusCounts, getEffectiveVehicleStatus,
    uniqueTypes: [...new Set(vehicles.map(v => v.type).filter(Boolean))], handleCloseForm, handleRefresh,
    handleAddVehicle: () => { setEditingVehicle(null); setShowForm(true); },
    handleEditVehicle: v => { setEditingVehicle(v); setShowForm(true); },
    handleCreateSubmit: data => createVehicle(data, afterSave),
    handleUpdateSubmit: (id, data) => updateVehicle(id, data, afterSave) };
};
