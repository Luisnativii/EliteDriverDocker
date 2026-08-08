import { useState, useCallback, useEffect } from 'react';
import { useVehicles, useAuthCheck, useVehicleOperations } from './useVehicles';

/**
 * Hook personalizado para gestionar las operaciones de mantenimiento de vehículos.
 * Este hook permite filtrar, agrupar, actualizar el estado y manejar las acciones de los vehículos
 * (como la actualización de su estado a través de drag-and-drop).
 * 
 * @returns {Object} - Retorna un objeto con la lógica para gestionar las operaciones de mantenimiento de vehículos.
 */

export const useVehicleMaintenance = () => {
  // Hooks externos
  const { vehicles, loading, error, refetch } = useVehicles();
  const { hasAdminRole, isAuthenticated, loading: authLoading } = useAuthCheck();
  const { updateVehicle, isLoading: operationLoading } = useVehicleOperations();
  
  // Estados del componente
  const [draggedVehicle, setDraggedVehicle] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  // Definir los estados y sus configuraciones
  const statusColumns = {
    maintenanceRequired: {
      title: 'Requiere mantenimiento',
      icon: 'AlertCircle',
      color: 'yellow',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20'
    },
    underMaintenance: {
      title: 'En mantenimiento',
      icon: 'Wrench',
      color: 'orange',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      iconBg: 'bg-orange-500/20'
    },
    maintenanceCompleted: {
      title: 'Mantenimiento al día',
      icon: 'CheckCircle',
      color: 'emerald',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20'
    },
    outOfService: {
      title: 'Fuera de servicio',
      icon: 'XCircle',
      color: 'red',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      iconBg: 'bg-red-500/20'
    }
  };

  // Filtrar vehículos basado en búsqueda y tipo
  const filteredVehicles = useCallback(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterType === 'all' ||
        vehicle.type?.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [vehicles, searchTerm, filterType]);

  // Agrupar vehículos por estado
  const vehiclesByStatus = useCallback(() => {
    const filtered = filteredVehicles();
    const grouped = {};
    
    // Inicializar todas las columnas
    Object.keys(statusColumns).forEach(status => {
      grouped[status] = [];
    });
    
    // Agrupar vehículos filtrados por estado
    filtered.forEach(vehicle => {
      const status = vehicle.status || 'maintenanceCompleted';
      if (grouped[status]) {
        grouped[status].push(vehicle);
      }
    });
    
    return grouped;
  }, [filteredVehicles, statusColumns]);

  // Obtener tipos únicos para el filtro
  const uniqueTypes = useCallback(() => {
    return [...new Set(vehicles.map(v => v.type).filter(Boolean))];
  }, [vehicles]);

  // Calcular estadísticas por estado
  const getStatusCounts = useCallback(() => {
    const filtered = filteredVehicles();
    const counts = {};
    
    Object.keys(statusColumns).forEach(status => {
      counts[status] = filtered.filter(v => (v.status || 'maintenanceCompleted') === status).length;
    });
    
    counts.total = filtered.length;
    return counts;
  }, [filteredVehicles, statusColumns]);

  // Handlers para drag and drop
  const handleDragStart = useCallback((e, vehicle) => {
    setDraggedVehicle(vehicle);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedVehicle(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedVehicle) return;
    
    const currentStatus = draggedVehicle.status || 'maintenanceCompleted';
    if (currentStatus === newStatus) return;
    
    // Verificar permisos
    if (!hasAdminRole) {
      alert('Solo los administradores pueden cambiar el estado de los vehículos');
      return;
    }
    
    // Mostrar confirmación para cambios críticos
    if (newStatus === 'outOfService' || currentStatus === 'outOfService') {
      setPendingStatusChange({
        vehicle: draggedVehicle,
        newStatus,
        currentStatus
      });
      setShowConfirmDialog(true);
    } else {
      updateVehicleStatus(draggedVehicle.id, newStatus);
    }
    
    setDraggedVehicle(null);
  }, [draggedVehicle, hasAdminRole]);

  // Función para actualizar el estado del vehículo
  const updateVehicleStatus = useCallback(async (vehicleId, newStatus) => {
    try {
      await updateVehicle(vehicleId, { status: newStatus }, () => {
        refetch();
      });
    } catch (error) {
      // console.error('Error al actualizar estado del vehículo:', error);
      alert('Error al actualizar el estado del vehículo: ' + error.message);
    }
  }, [updateVehicle, refetch]);

  // Confirmar cambio de estado
  const handleConfirmStatusChange = useCallback(() => {
    if (pendingStatusChange) {
      updateVehicleStatus(pendingStatusChange.vehicle.id, pendingStatusChange.newStatus);
    }
    setShowConfirmDialog(false);
    setPendingStatusChange(null);
  }, [pendingStatusChange, updateVehicleStatus]);

  // Cancelar cambio de estado
  const handleCancelStatusChange = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingStatusChange(null);
  }, []);

  // Handler para refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handlers para filtros
  const handleSearchTermChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleFilterTypeChange = useCallback((type) => {
    setFilterType(type);
  }, []);

  // Función para obtener el mensaje de confirmación
  const getConfirmationMessage = useCallback(() => {
    if (!pendingStatusChange) return '';
    
    const { vehicle, newStatus, currentStatus } = pendingStatusChange;
    const newStatusTitle = statusColumns[newStatus]?.title || newStatus;
    const currentStatusTitle = statusColumns[currentStatus]?.title || currentStatus;
    
    return `¿Estás seguro de cambiar el estado del vehículo "${vehicle.name}" de "${currentStatusTitle}" a "${newStatusTitle}"?`;
  }, [pendingStatusChange, statusColumns]);

  return {
    // Estados
    loading,
    error,
    authLoading,
    hasAdminRole,
    isAuthenticated,
    operationLoading,
    draggedVehicle,
    dragOverColumn,
    searchTerm,
    filterType,
    showConfirmDialog,
    pendingStatusChange,
    
    // Datos computados
    vehicles: filteredVehicles(),
    vehiclesByStatus: vehiclesByStatus(),
    uniqueTypes: uniqueTypes(),
    statusCounts: getStatusCounts(),
    statusColumns,
    
    // Handlers de drag and drop
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    
    // Handlers de estado
    updateVehicleStatus,
    handleConfirmStatusChange,
    handleCancelStatusChange,
    
    // Handlers generales
    handleRefresh,
    handleSearchTermChange,
    handleFilterTypeChange,
    
    // Funciones de utilidad
    getConfirmationMessage,
    
    // Setters
    setSearchTerm,
    setFilterType
  };
};