import React from 'react';
import { useState } from 'react';
import { useReservationManagement } from '../../hooks/useReservationManagement';
import ReservationDetailModal from '@/components/reservation/ReservationDetailModal';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Search,
  AlertCircle,
  RefreshCw,
  Filter,
  Calendar,
  DollarSign,
  Users,
  Car,
  TrendingUp,
  Eye,
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-toastify';

const ReservationManagementPage = () => {

  const {
    // Estados
    loading,
    error,
    authLoading,
    isAuthenticated,
    hasAdminRole,
    operationLoading,
    reservations,
    searchTerm,
    filterStatus,
    filterVehicleType,
    dateFilter,
    sortBy,
    sortOrder,
    showConfirmDialog,

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
    setError
  } = useReservationManagement();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

    const handleRefreshWithToast = async () => {
    try {
      const result = handleRefresh();

      // Por si handleRefresh es async (devuelve una promesa)
      if (result && typeof result.then === 'function') {
        await result;
      }

      toast.success('Reservas actualizadas correctamente');
    } catch (err) {
      toast.error('Error al actualizar las reservas');
      console.error(err);
    }
  };


  // Mostrar loading mientras se cargan auth y reservas
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
            Debes iniciar sesión para acceder a la gestión de reservas
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

  // Verificar permisos de administrador
  if (!hasAdminRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Permisos Insuficientes
          </h2>
          <p className="text-white/80 mb-6">
            Se requieren permisos de administrador para acceder a la gestión de reservas
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getDerivedStatus = (reservation) => {
    const now = new Date();
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);

    if (start > now) return 'Próxima';
    if (start <= now && end >= now) return 'Activa';
    if (end < now) return 'Completada';
    return 'desconocida';
  };


  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-7xl mt-18 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestión de Reservas
              </h1>
              <p className="text-white/70">
                Administra y supervisa todas las reservas del sistema
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshWithToast}
                disabled={operationLoading}
                className="flex items-center  cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-300 border border-white/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${operationLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Reservas</p>
                <p className="text-2xl font-bold text-white">{reservationStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Activas</p>
                <p className="text-2xl font-bold text-green-400">{reservationStats.active}</p>
              </div>
              <Car className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Próximas</p>
                <p className="text-2xl font-bold text-yellow-400">{reservationStats.upcoming}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Completadas</p>
                <p className="text-2xl font-bold text-blue-400">{reservationStats.completed}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Ingresos Total</p>
                <p className="text-2xl font-bold text-emerald-400">{formatPrice(reservationStats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="xl:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por usuario, vehículo, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">Todos los estados</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status} className="bg-gray-900">
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtro por tipo de vehículo */}
            <div>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <select
                  value={filterVehicleType}
                  onChange={(e) => setFilterVehicleType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">Todos los tipos</option>
                  {uniqueVehicleTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-900">{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtro por fecha */}
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">Todas las fechas</option>
                  <option value="today" className="bg-gray-900">Hoy</option>
                  <option value="week" className="bg-gray-900">Esta semana</option>
                  <option value="month" className="bg-gray-900">Este mes</option>
                  <option value="past" className="bg-gray-900">Pasadas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                <span className="text-red-200 font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-100 text-sm font-semibold px-4 py-2 bg-red-500/20 rounded-lg transition-all duration-300 hover:bg-red-500/30"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Tabla de Reservas */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('userName')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Usuario</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('vehicleName')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Vehículo</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('startDate')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Fecha Inicio</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('endDate')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Fecha Fin</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('totalPrice')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Precio Total</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Estado</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-white/40 mb-4" />
                        <p className="text-white/60 text-lg font-medium mb-2">
                          No se encontraron reservas
                        </p>
                        <p className="text-white/40 text-sm">
                          {searchTerm || filterStatus !== 'all' || filterVehicleType !== 'all' || dateFilter !== 'all'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'Aún no hay reservas en el sistema'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          #{reservation.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">
                            {reservation.user.name}
                          </div>
                          <div className="text-xs text-white/60">
                            {reservation.user.email}
                          </div>
                          <div className="text-xs text-white/40">
                            DUI: {reservation.user.dui}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">
                            {reservation.vehicle.name}
                          </div>
                          <div className="text-xs text-white/60">
                            {reservation.vehicle.brand} {reservation.vehicle.model}
                          </div>
                          <div className="text-xs text-white/40">
                            Tipo: {reservation.vehicle.type} | Cap: {reservation.vehicle.capacity}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {formatDate(reservation.startDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {formatDate(reservation.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-emerald-400">
                          {formatPrice(reservation.totalPrice)}
                        </div>
                        <div className="text-xs text-white/60">
                          {(() => {
                            const start = new Date(reservation.startDate);
                            const end = new Date(reservation.endDate);
                            const diffTime = Math.abs(end - start);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const status = getDerivedStatus(reservation);
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          );
                        })()}

                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewReservation(reservation)}
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {['Activa', 'Próxima'].includes(getDerivedStatus(reservation)) && (
                            <button
                              onClick={() => initiateCancel(reservation)}
                              disabled={operationLoading}
                              className="text-red-400 hover:text-red-300 transition-colors duration-200 disabled:opacity-50"
                              title="Cancelar reserva"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Información de paginación */}
        <div className="mt-6 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-6 py-4">
          <div className="text-sm text-white/70">
            Mostrando {reservations.length} de {reservationStats.total} reservas
          </div>
          <div className="text-sm text-white/70">
            Filtros aplicados: {[
              searchTerm && `Búsqueda: "${searchTerm}"`,
              filterStatus !== 'all' && `Estado: ${getStatusLabel(filterStatus)}`,
              filterVehicleType !== 'all' && `Tipo: ${filterVehicleType}`,
              dateFilter !== 'all' && `Fecha: ${dateFilter}`
            ].filter(Boolean).join(', ') || 'Ninguno'}
          </div>
        </div>

        {/* Modal de confirmación */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelConfirm}
          title="Cancelar Reserva"
          message={getConfirmationMessage()}
          confirmText="Sí, cancelar"
          cancelText="No, mantener"
          type="danger"
          loading={operationLoading}
        />
      </div>

      <ReservationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        reservation={selectedReservation}
        formatDate={formatDate}
        formatPrice={formatPrice}
      />

    </div>
  );
};

export default ReservationManagementPage;