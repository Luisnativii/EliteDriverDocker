import React from 'react';
import { X, Calendar, Wrench, Car } from 'lucide-react';

const MaintenanceHistoryWindow = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  return (
    // Overlay de fondo
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Ventana centrada */}
      <div className="w-full max-w-2xl mx-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl text-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{vehicle.name}</h3>
              <p className="text-white/70 text-sm">{vehicle.brand} {vehicle.model}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-5rem)]">
          {/* Vehicle Info */}
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-white/70 block mb-1">Kilómetros actuales</span>
                <span className="text-white font-medium">{vehicle.kilometers?.toLocaleString()} km</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-white/70 block mb-1">Tipo</span>
                <span className="text-white font-medium">{vehicle.type}</span>
              </div>
            </div>
          </div>

          {/* Maintenance History */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Wrench className="w-5 h-5 text-red-400" />
              <h4 className="text-lg font-semibold text-white">Historial de Mantenimiento</h4>
            </div>

            {/* Stats */}
            {vehicle.maintenanceRecords?.length > 0 && (
              <div className="mb-4 py-4 border-y border-white/20">
                <div className="w-full text-sm">
                  <div className="flex gap-3 justify-center bg-blue-500/10 rounded-lg p-3 text-center">
                    <span className="text-blue-400 font-bold text-sm block">
                      {vehicle.maintenanceRecords.length}
                    </span>
                    <span className="text-white/70">Mantenimientos en total</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {vehicle.maintenanceRecords?.length > 0 ? (
                vehicle.maintenanceRecords.map((record, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border-l-4 border-red-400/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-white font-medium">
                          Mantenimiento #{vehicle.maintenanceRecords.length - index}

                        </span>
                      </div>
                      <span className="text-white/70 text-sm">
                        {new Date(record.maintenanceDate || record.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/70">Kilómetros:</span>
                        <span className="text-white">{record.kmAtMaintenance?.toLocaleString()} km</span>
                      </div>
                      
                      {record.description && (
                        <div className="mt-2">
                          <span className="text-white/70 block mb-1">Descripción:</span>
                          <p className="text-white/90 text-sm bg-white/5 rounded p-2">
                            {record.description}
                          </p>
                        </div>
                      )}
                      
                      {record.cost && (
                        <div className="flex justify-between mt-2">
                          <span className="text-white/70">Costo:</span>
                          <span className="text-green-400 font-medium">${record.cost.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">
                    No hay registros de mantenimiento aún
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Los mantenimientos aparecerán aquí una vez registrados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryWindow;