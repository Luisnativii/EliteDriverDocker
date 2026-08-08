import React from 'react';
import { Car, Calendar, Eye } from 'lucide-react';

const VehicleDragCard = ({
  vehicle,
  onDragStart,
  onDragEnd,
  isDragging,
  onViewHistory
}) => {
  const handleViewHistory = (e) => {
    e.stopPropagation();
    onViewHistory(vehicle);
  };
  const latestRecord = vehicle.maintenanceRecords[0];


  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, vehicle)}
      onDragEnd={onDragEnd}
      className={`bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 cursor-move hover:bg-white/20 transition-all duration-300 transform hover:scale-105 ${isDragging ? 'opacity-50 rotate-3' : ''
        }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg truncate">{vehicle.name}</h3>
          <p className="text-white/70 text-sm">{vehicle.brand} {vehicle.model}</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Botón para ver historial */}
          <button
            onClick={handleViewHistory}
            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-200 group"
            title="Ver historial de mantenimiento"
          >
            <Eye className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
          </button>

          <div className="p-2 bg-white/10 rounded-lg">
            <Car className="w-4 h-4 text-white/60" />
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Tipo:</span>
          <span className="text-white">{vehicle.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Kilómetros:</span>
          <span className="text-white">{vehicle.kilometers?.toLocaleString()} km</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Capacidad:</span>
          <span className="text-white">{vehicle.capacity} personas</span>
        </div>

        {/* Información adicional del último mantenimiento */}
        {/* Información adicional del último mantenimiento */}
        {vehicle.maintenanceRecords?.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs">Última alerta de mantenimiento:</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-white/60" />
                <span className="text-white/80 text-xs">
                  {new Date(
                    vehicle.maintenanceRecords[0].maintenanceDate || vehicle.maintenanceRecords[0].createdAt
                  ).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {vehicle.image && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-24 object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default VehicleDragCard;