import React, { useState } from 'react';
import { useVehicleMaintenance } from '../../hooks/useVehicleMaintenance';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { 
  Search, 
  AlertCircle, 
  RefreshCw,
  Filter,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify'; 

import StatusColumn from '../../components/admin/StatusColumn';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MaintenanceHistoryWindow from '../../components/vehicle/MaintenanceHistoryModal';

/**
 * Página de gestión de mantenimiento de vehículos.
 * Permite a los administradores gestionar el estado de mantenimiento de los vehículos mediante un sistema de columnas tipo "Kanban".
 * Los usuarios con rol de administrador pueden realizar cambios en el estado de los vehículos, como ponerlos en mantenimiento o marcarlos como fuera de servicio.
 * Además, proporciona filtros y una vista para ver el historial de mantenimiento de cada vehículo.
 */

const MaintenancePage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const {
    // Estados
    loading,
    error,
    authLoading,
    isAuthenticated,
    hasAdminRole,
    operationLoading,
    searchTerm,
    filterType,
    showConfirmDialog,
    
    // Datos computados
    vehiclesByStatus,
    uniqueTypes,
    statusCounts,
    statusColumns,
    
    // Handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleConfirmStatusChange,
    handleCancelStatusChange,
    handleRefresh,
    setSearchTerm,
    setFilterType,
    getConfirmationMessage,
    draggedVehicle,
    dragOverColumn
  } = useVehicleMaintenance();

  // Función para manejar la visualización del historial de mantenimiento de un vehículo
  const handleViewHistory = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleCloseHistory = () => {
    setSelectedVehicle(null);
  };

   const handleRefreshWithToast = async () => {
    try {
      const result = handleRefresh();

      // Por si handleRefresh es async (devuelve una promesa)
      if (result && typeof result.then === 'function') {
        await result;
      }

      toast.success('Mantenimientos actualizados correctamente');
    } catch (err) {
      toast.error('Error al actualizar los mantenimientos');
      console.error(err);
    }
   };

  // Mostrar loading mientras se cargan auth y vehículos
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Acceso Restringido
          </h2>
          <p className="text-white/80 mb-6">
            Debes iniciar sesión para acceder a la gestión de mantenimiento
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-7xl mt-18 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestión de Mantenimiento
              </h1>
              <p className="text-white/70">
                Administra el estado de mantenimiento de tu flota de vehículos
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshWithToast}
                disabled={operationLoading}
                className="flex items-center cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-300 border border-white/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${operationLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar vehículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">Todos los tipos</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-900">{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        {hasAdminRole && statusCounts.total > 0 && (
          <div className="mt-4 mb-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="flex items-start space-x-3">
              <Settings className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">Instrucciones de uso</h3>
                <div className="text-white/70 text-sm space-y-1">
                  <p>• Arrastra y suelta los vehículos entre columnas para cambiar su estado de mantenimiento</p>
                  <p>• Haz clic en el icono de ojo para ver el historial de mantenimiento en la ventana lateral</p>
                  <p>• Los cambios se guardan automáticamente al soltar el vehículo</p>
                  <p>• Usa los filtros para encontrar vehículos específicos</p>
                  <p>• Los cambios críticos (como "Fuera de Servicio") requieren confirmación</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                <span className="text-red-200 font-medium">{error}</span>
              </div>
              <button
                onClick={handleRefresh}
                className="text-red-300 hover:text-red-100 text-sm font-semibold px-4 py-2 bg-red-500/20 rounded-lg transition-all duration-300 hover:bg-red-500/30"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Advertencia para usuarios no admin */}
        {!hasAdminRole && (
          <div className="mb-8 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-yellow-400 mr-3" />
              <span className="text-yellow-200 font-medium">
                Solo puedes ver el estado de los vehículos. Se requieren permisos de administrador para cambiar estados.
              </span>
            </div>
          </div>
        )}

        {/* Columnas Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {Object.entries(statusColumns).map(([status, config]) => (
            <StatusColumn
              key={status}
              status={status}
              config={config}
              vehicles={vehiclesByStatus[status] || []}
              count={statusCounts[status]}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverColumn={dragOverColumn}
              draggedVehicle={draggedVehicle}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>

        {/* Dialog de confirmación */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          message={getConfirmationMessage()}
          onConfirm={handleConfirmStatusChange}
          onCancel={handleCancelStatusChange}
        />

        {/* Ventana de historial de mantenimiento */}
        {selectedVehicle && (
          <MaintenanceHistoryWindow
            vehicle={selectedVehicle}
            onClose={handleCloseHistory}
          />
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;