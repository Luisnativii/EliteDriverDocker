import React from 'react';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const VehicleFilterForm = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  uniqueTypes,
  hasAdminRole,
  onAddVehicle,
  onRefresh
}) => {
const handleRefreshClick = () => {
    if (onRefresh) {
      const result = onRefresh();

      if (result && typeof result.then === 'function') {
        result
          .then(() => {
            toast.success('Vehículos actualizados');
          })
          .catch(() => {
            toast.error('Error al actualizar los vehículos');
          });
      } else {
        // Si es síncrono
        toast.success('Vehículos actualizados');
      }
    }
  };


  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 mb-8 overflow-hidden">
      <div className="px-8 py-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Gestión de Vehículos
              </h1>
              <p className="text-white/70 text-sm">
                {hasAdminRole ? 
                  'Panel administrativo para gestionar la flota de vehículos premium' :
                  'Catálogo de vehículos disponibles para renta'
                }
              </p>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 flex gap-3">
            <button
              onClick={handleRefreshClick}
              className="group inline-flex items-center px-4 py-2.5 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium rounded-lg transition-all duration-300 backdrop-blur-sm hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
              Actualizar
            </button>
            {hasAdminRole && (
              <button
                onClick={onAddVehicle}
                className="inline-flex items-center px-6 py-2.5 cursor-pointer bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Vehículo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda con glassmorphism */}
      <div className="px-8 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent appearance-none min-w-[180px] transition-all duration-300 hover:bg-white/15"
            >
              <option value="all" className="bg-gray-900 text-white">Todos los tipos</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type} className="bg-gray-900 text-white">{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilterForm;