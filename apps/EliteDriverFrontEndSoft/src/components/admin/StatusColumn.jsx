import React from 'react';
import VehicleDragCard from '../vehicle/VehicleDragCard';
import { 
  AlertCircle, 
  Wrench,
  CheckCircle,
  XCircle
} from 'lucide-react';

/**
 * Componente de columna de estado para mostrar y gestionar vehículos en diferentes estados.
 * Permite arrastrar y soltar vehículos entre estados, con visualización de información relacionada.
 * 
 * @param {string} status - El estado actual de la columna (p.ej., "maintenance", "completed").
 * @param {Object} config - Configuración de la columna, incluyendo título, icono, colores, etc.
 * @param {Array} vehicles - Lista de vehículos asociados a este estado.
 * @param {number} count - Número de vehículos en este estado.
 * @param {function} onDragOver - Función para manejar el evento de arrastre sobre la columna.
 * @param {function} onDragLeave - Función para manejar el evento de salida de arrastre.
 * @param {function} onDrop - Función para manejar el evento de soltar el vehículo en la columna.
 * @param {string} dragOverColumn - Estado de la columna que está siendo arrastrada sobre ella.
 * @param {Object} draggedVehicle - El vehículo actualmente arrastrado.
 * @param {function} onDragStart - Función que se ejecuta cuando el usuario comienza a arrastrar un vehículo.
 * @param {function} onDragEnd - Función que se ejecuta cuando el usuario termina de arrastrar un vehículo.
 * @param {function} onViewHistory - Función para ver el historial de un vehículo.
 */

const StatusColumn = ({ 
  status, 
  config, 
  vehicles, 
  count,
  onDragOver, 
  onDragLeave, 
  onDrop, 
  dragOverColumn,
  draggedVehicle,
  onDragStart,
  onDragEnd,
  onViewHistory
}) => {
  const IconComponent = {
    AlertCircle,
    Wrench,
    CheckCircle,
    XCircle
  }[config.icon];

  const isOver = dragOverColumn === status;
  const canDrop = draggedVehicle && (draggedVehicle.status || 'maintenanceCompleted') !== status;

  return (
    <div 
      className={`bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 transition-all duration-300 ${
        isOver && canDrop ? 'bg-white/15 border-white/30 scale-105' : ''
      }`}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Header de la columna */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`p-2 ${config.iconBg} rounded-xl mr-3`}>
            <IconComponent className={`w-5 h-5 ${config.textColor}`} />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">{config.title}</h2>
            <p className="text-white/60 text-sm">{count} vehículo{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className={`px-3 py-1 ${config.bgColor} rounded-full border ${config.borderColor}`}>
          <span className={`text-sm font-medium ${config.textColor}`}>{count}</span>
        </div>
      </div>

      {/* Zona de drop */}
      {isOver && canDrop && (
        <div className={`mb-4 p-4 border-2 border-dashed ${config.borderColor} rounded-xl ${config.bgColor} flex items-center justify-center`}>
          <span className={`text-sm font-medium ${config.textColor}`}>
            Soltar aquí para cambiar estado
          </span>
        </div>
      )}

      {/* Lista de vehículos */}
      <div className="space-y-3 min-h-[200px]">
        {vehicles.map((vehicle) => (
          <VehicleDragCard
            key={vehicle.id}
            vehicle={vehicle}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onViewHistory={onViewHistory}
            isDragging={draggedVehicle?.id === vehicle.id}
          />
        ))}
        
        {vehicles.length === 0 && (
          <div className="text-center py-8">
            <div className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <IconComponent className={`w-6 h-6 ${config.textColor}`} />
            </div>
            <p className="text-white/60 text-sm">No hay vehículos en este estado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusColumn;