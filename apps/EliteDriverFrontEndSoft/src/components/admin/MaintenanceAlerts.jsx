import React from 'react';
import { AlertTriangle, Car, Wrench, Calendar } from 'lucide-react';
import { useVehicles } from '../../hooks/useVehicles';

const MaintenanceAlerts = () => {
  const { vehicles, loading, error } = useVehicles();
  
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenanceRequired');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70"></div>
        <p className="text-white/70 ml-3">Cargando alertas...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">Error al cargar alertas: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Stats Header */}
      {maintenanceVehicles.length > 0 && (
        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20 flex-shrink-0">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-bold text-lg">
                {maintenanceVehicles.length}
              </span>
            </div>
            <span className="text-white/70 text-sm">
              {maintenanceVehicles.length === 1 ? 'Vehículo requiere' : 'Vehículos requieren'} mantenimiento
            </span>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10">
        <div className="space-y-3">
          {maintenanceVehicles.length > 0 ? (
            maintenanceVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="bg-white/5 rounded-lg p-4 border-l-4 border-red-400/50 hover:bg-white/10 transition-all duration-200"
              >
                {/* Vehicle Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">
                        {vehicle.name}
                      </h4>
                      <p className="text-white/60 text-xs">
                        {vehicle.brand} {vehicle.model}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-white/60 block mb-1">Kilómetros</span>
                    <span className="text-white font-medium">
                      {vehicle.kilometers?.toLocaleString()} km
                    </span>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <span className="text-white/60 block mb-1">Tipo</span>
                    <span className="text-white font-medium">
                      {vehicle.type || 'No definido'}
                    </span>
                  </div>
                </div>

                {/* Maintenance Info */}
                {vehicle.lastMaintenanceDate && (
                  <div className="mt-3 flex items-center space-x-2 text-xs">
                    <Calendar className="w-3 h-3 text-white/60" />
                    <span className="text-white/60">Último mantenimiento:</span>
                    <span className="text-white">
                      {new Date(vehicle.lastMaintenanceDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}

                {/* Action Indicator */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-3 h-3 text-red-400" />
                    <span className="text-red-400 text-xs font-medium">
                      Requiere atención inmediata
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white/70 text-sm font-medium mb-1">
                ¡Todo en orden!
              </p>
              <p className="text-white/50 text-xs">
                No hay vehículos que requieran mantenimiento en este momento
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceAlerts;