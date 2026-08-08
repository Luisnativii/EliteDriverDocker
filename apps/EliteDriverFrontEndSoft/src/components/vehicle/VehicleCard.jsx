import React, { useState } from 'react';
import { useVehicleOperations } from '../../hooks/useVehicles';
import {
  Edit2,
  Trash2,
  Loader2,
  Users,
  MapPin,
  DollarSign,
  Car,
  AlertTriangle,
  CheckCircle,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Componente de tarjeta de vehículo.
 * Muestra la información de un vehículo con opciones para editar, eliminar o ver detalles.
 * 
 * @param {Object} vehicle - Datos del vehículo a mostrar.
 * @param {function} onEdit - Función para editar el vehículo.
 * @param {function} onRefresh - Función para refrescar la lista de vehículos después de una acción (por ejemplo, eliminación).
 * @param {boolean} isAdmin - Indicador de si el usuario tiene permisos de administrador para realizar acciones como editar o eliminar.
 */

const VehicleCard = ({ vehicle, onEdit, onRefresh, isAdmin = false }) => {
  const { deleteVehicle } = useVehicleOperations();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Convierte una imagen base64 a un enlace de imagen válido.
   *
   * @param {string} base64 - La imagen en formato base64.
   * @returns {string|null} - Enlace de imagen en formato base64 o null si no hay imagen.
   */

  const getBase64ImageSrc = (base64) => {
    if (!base64) return null;
    const mimeType =
      base64.trim().startsWith("/") ? "image/jpeg"
        : base64.trim().startsWith("iVBOR") ? "image/png"
          : base64.trim().startsWith("UklGR") ? "image/webp"
            : "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  };

  const nextImage = () => {
    if (!vehicle.listImagesBase64 || vehicle.listImagesBase64.length === 0) return;
    setCurrentIndex((prev) =>
      prev === vehicle.listImagesBase64.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!vehicle.listImagesBase64 || vehicle.listImagesBase64.length === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? vehicle.listImagesBase64.length - 1 : prev - 1
    );
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(vehicle, true);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteVehicle(vehicle.id);
      toast.success("Vehículo eliminado correctamente");
      if (onRefresh) onRefresh();


    } catch (error) {
      toast.error(`Error al actualizar el vehículo: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * Formatea el precio del vehículo a formato de moneda USD.
   *
   * @param {number} price - Precio del vehículo.
   * @returns {string} - Precio formateado como moneda en USD.
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  /**
   * Formatea los kilómetros recorridos por el vehículo con separadores de miles.
   *
   * @param {number} km - Kilómetros del vehículo.
   * @returns {string} - Kilómetros formateados con separadores de miles.
   */

  const formatKilometers = (km) => {
    return new Intl.NumberFormat('es-US').format(km);
  };

  /**
   * Obtiene la configuración del estado del vehículo para mostrar en la tarjeta.
   *
   * @param {string} status - El estado actual del vehículo (por ejemplo, 'available', 'reserved').
   * @returns {Object} - Configuración del estado con texto, clase de estilo y icono correspondiente.
   */

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return {
          text: 'Disponible',
          className: 'bg-green-500text-white',
          iconColor: 'text-white',
          icon: CheckCircle,
        };
      case 'reserved':
        return {
          text: 'Reservado',
          className: 'bg-blue-500 text-white',
          iconColor: 'text-white',
          icon: Users,
        };
      case 'underMaintenance':
        return {
          text: 'En mantenimiento',
          className: 'bg-yellow-500 text-white',
          iconColor: 'text-white',
          icon: Wrench,
        };
      case 'maintenanceRequired':
        return {
          text: 'Requiere mantenimiento',
          className: 'bg-orange-500  text-white',
          iconColor: 'text-white',
          icon: AlertTriangle,
        };
      case 'maintenanceCompleted':
        return {
          text: 'Mantenimiento al día',
          className: 'bg-emerald-500 text-white',
          iconColor: 'text-white',
          icon: CheckCircle,
        };
      case 'outOfService':
        return {
          text: 'Fuera de Servicio',
          className: 'bg-red-500 text-white',
          iconColor: 'text-white',
          icon: AlertTriangle,
        };
      default:
        return {
          text: 'Estado Desconocido',
          className: 'bg-gray-500 text-white',
          iconColor: 'text-white',
          icon: AlertTriangle,
        };
    }
  };

  const renderStatus = () => {
    const effectiveStatus = vehicle.effectiveStatus || vehicle.status;
    if (!effectiveStatus) return null;
    const statusConfig = getStatusConfig(effectiveStatus);
    const StatusIcon = statusConfig.icon;

    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${statusConfig.className} ${statusConfig.glow}`}>
        <StatusIcon className={`w-3.5 h-3.5 mr-1.5 ${statusConfig.iconColor}`} />
        {statusConfig.text}
      </div>
    );
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* Imagen principal con overlay gradient */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-56 overflow-hidden">
          {vehicle.mainImageBase64 ? (
            <>
              <img
                src={getBase64ImageSrc(vehicle.mainImageBase64)}
                alt={vehicle.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/images/vehicle-placeholder.jpg")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
              <Car className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Badge de tipo de vehículo */}
          {vehicle.type && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-gray-800 shadow-lg">
                {vehicle.type}
              </span>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-4 right-4">
            {renderStatus()}
          </div>

          {/* Slider secundario */}
          {vehicle.listImagesBase64 && vehicle.listImagesBase64.length > 0 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextImage}
                className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 right-4 w-24 h-20 rounded-xl overflow-hidden border-2 border-white shadow-2xl ring-2 ring-white/50 transition-transform duration-300 hover:scale-110">
                <img
                  src={getBase64ImageSrc(vehicle.listImagesBase64[currentIndex])}
                  className="w-full h-full object-cover"
                  alt="preview"
                />
              </div>

              {/* Indicadores de posición */}
              <div className="absolute bottom-4 left-4 flex gap-1.5">
                {vehicle.listImagesBase64.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                      ? 'w-6 bg-white shadow-lg'
                      : 'w-1.5 bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Contenido de la tarjeta */}
        <div className="p-6">
          {/* Header con nombre */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {vehicle.name}
            </h3>
            <p className="text-sm font-medium text-gray-500">
              {vehicle.brand} • {vehicle.model}
            </p>
          </div>

          {/* Información del vehículo con iconos mejorados */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3">
                <Users className="w-4 h-4 " />
              </div>
              <span className="text-gray-700 font-medium">
                {vehicle.capacity} personas
              </span>
            </div>

            <div className="flex items-center text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-gray-700 font-medium">
                {formatKilometers(vehicle.kilometers)} km
              </span>
            </div>

            <div className="flex items-center text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(vehicle.price)}
                <span className="text-sm font-normal text-gray-500 ml-1">/ día</span>
              </span>
            </div>
          </div>

          {/* Características con mejor diseño */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {vehicle.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                  >
                    {feature}
                  </span>
                ))}
                {vehicle.features.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                    +{vehicle.features.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción mejorados */}
          {isAdmin && (
            <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={handleEdit}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl text-white bg-black cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex-1 inline-flex items-center justify-center cursor-pointer px-4 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación mejorado */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar el vehículo <strong className="text-gray-900">{vehicle.name}</strong>?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 cursor-pointer text-sm font-semibold border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 cursor-pointer text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  ); 
};

export default VehicleCard;