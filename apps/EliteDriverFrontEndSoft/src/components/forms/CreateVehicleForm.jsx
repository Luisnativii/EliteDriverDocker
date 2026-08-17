// components/CreateVehicleForm.jsx

import React from 'react';
import { useVehicleForm } from '../../hooks/useVehicleForm';
import { toast } from 'react-toastify';

/**
 * Formulario para crear un vehículo.
 * Este formulario permite ingresar todos los datos necesarios para registrar un nuevo vehículo en el sistema, incluyendo imágenes y características.
 *
 * @param {function} onSubmit - Función que se ejecuta cuando el formulario es enviado.
 * @param {function} onCancel - Función que se ejecuta cuando el formulario es cancelado.
 * @param {boolean} submitLoading - Indicador de si el formulario está siendo procesado.
 */

const CreateVehicleForm = ({ onSubmit, onCancel, submitLoading = false }) => {
  // Hook personalizado para manejar el estado y la validación del formulario.
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    setFormData,
    setErrors
  } = useVehicleForm({}, false); // false = modo creación

  // Tipos de vehículos disponibles para seleccionar en el formulario.
  const vehicleTypes = [
    'Sedan',
    'SUV',
    'PickUp',
    'Microbus',
  ];

  const [currentImage, setCurrentImage] = React.useState(0);
  const handleSecondaryImageUrlsChange = (e) => {
    const urls = e.target.value
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean);

    setFormData((prev) => ({
      ...prev,
      listImageUrls: urls,
    }));
  };

  // Lista de todas las imágenes, combinando la principal y las secundarias.

  const allImages = [
    formData.mainImageUrl,
    ...(formData.listImageUrls || [])
  ].filter(Boolean);

  const goNext = () => {
    if (allImages.length > 0)
      setCurrentImage((prev) => (prev + 1) % allImages.length);
  };

  const goPrev = () => {
    if (allImages.length > 0)
      setCurrentImage((prev) =>
        prev === 0 ? allImages.length - 1 : prev - 1
      );
  };

  /**
   * Elimina una imagen seleccionada, ya sea la principal o una secundaria.
   * Ajusta el índice de la imagen mostrada si es necesario.
   *
   * @param {number} index - Índice de la imagen a eliminar.
   */

  const removeImage = (index) => {
    if (index === 0) {
      setFormData(prev => ({ ...prev, mainImageUrl: null }));
    } else {
      const secondaryIndex = index - 1;
      setFormData(prev => {
        const newList = [...prev.listImageUrls];
        newList.splice(secondaryIndex, 1);
        return { ...prev, listImageUrls: newList };
      });
    }

    if (currentImage >= allImages.length - 1 && currentImage > 0) {
      setCurrentImage(currentImage - 1);
    }
  };

  /**
   * Maneja el cambio de las características del vehículo.
   * Actualiza el estado de las características y limpia los errores si es necesario.
   *
   * @param {Event} e - Evento del cambio de texto.
   */
  const handleFeaturesChange = (e) => {
    const value = e.target.value || '';

    setFormData(prev => ({
      ...prev,
      featuresText: value,
      features: value ? value.split(',').map(f => f.trim()).filter(f => f !== '') : []
    }));

    // Limpiar errores si los hay
    if (errors.features) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.features;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Validar que insurancePhone no esté vacío
    if (!formData.insurancePhone || !formData.insurancePhone.trim()) {
      setErrors(prev => ({
        ...prev,
        insurancePhone: 'El número telefónico de la aseguradora es requerido'
      }));
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const processedData = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      vehicleType: formData.vehicleType,
      capacity: parseInt(formData.capacity),
      pricePerDay: parseFloat(formData.pricePerDay),
      kilometers: parseInt(formData.kilometers),
      kmForMaintenance: parseInt(formData.kmForMaintenance),
      insurancePhone: formData.insurancePhone.trim(),

      features: formData.featuresText
        ? formData.featuresText.split(",").map(f => f.trim()).filter(f => f)
        : [],

      mainImageUrl: formData.mainImageUrl?.trim() || null,
      listImageUrls: formData.listImageUrls || []
    };

    try {
      await onSubmit(processedData);
      toast.success("Vehículo creado correctamente");
    } catch (error) {
      toast.error("Error al crear vehículo");
    }
  };

  return (
    <div className="border-none p-2">
      <style>
        {`
          .carousel-container {
            position: relative;
            width: 100%;
            height: 320px;
            overflow: hidden;
            border-radius: 12px;
            background: #262626;
            border: 1px solid #404040;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .carousel-slide {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
          }
          .carousel-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.4);
            color: white;
            padding: 0.5rem;
            border-radius: 9999px;
            border: none;
            cursor: pointer;
            z-index: 10;
            transition: background 0.2s;
          }
          .carousel-btn:hover {
            background: rgba(0, 0, 0, 0.6);
          }
          .carousel-btn-left {
            left: 0.5rem;
          }
          .carousel-btn-right {
            right: 0.5rem;
          }
        `}
      </style>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CARRUSEL DE IMÁGENES */}
        <div className="w-full">
          <div className="carousel-container">
            {allImages.length > 0 ? (
              <img
                src={allImages[currentImage]}
                className="carousel-slide"
                alt="preview"
                onError={(e) => {
                  e.currentTarget.src = "/images/vehicle-placeholder.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No hay imágenes seleccionadas
              </div>
            )}

            {/* Flecha Izquierda */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="carousel-btn carousel-btn-left"
              >
                ‹
              </button>
            )}

            {/* Flecha Derecha */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="carousel-btn carousel-btn-right"
              >
                ›
              </button>
            )}
          </div>

          {/*  MINIATURAS */}
          {allImages.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 pt-2">
              {allImages.map((img, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {/* Botón de eliminar */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-20 hover:bg-red-700 shadow-md"
                  >
                    ✕
                  </button>

                  <img
                    src={img}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border ${currentImage === index ? "border-red-500" : "border-gray-500"
                      }`}
                    onClick={() => setCurrentImage(index)}
                    alt={`Miniatura ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/vehicle-placeholder.jpg";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Imagen principal */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            URL de Imagen Principal *
          </label>

          <input
            type="url"
            name="mainImageUrl"
            value={formData.mainImageUrl || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 border text-white/80 bg-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mainImageUrl ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="https://ejemplo.com/vehiculo.jpg"
          />

          {errors.mainImageUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.mainImageUrl}</p>
          )}
        </div>

        {/* Imágenes secundarias */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            URLs de Imágenes Adicionales
          </label>

          <textarea
            value={(formData.listImageUrls || []).join("\n")}
            onChange={handleSecondaryImageUrlsChange}
            rows={4}
            className="w-full px-3 py-2 border text-white/80 bg-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            placeholder={"https://ejemplo.com/interior.jpg\nhttps://ejemplo.com/lateral.jpg"}
          />
        </div>
        <span className="text-xs text-white opacity-80">Pega URLs públicas de imágenes, una por línea para las adicionales.</span>

        {/* Información básica */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Nombre del Vehículo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border text-white/80 bg-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: Toyota Corolla 2023"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Marca *
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-white/80 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.brand ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: Toyota"
            />
            {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Modelo *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-white/80 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.model ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: Corolla"
            />
            {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Tipo de Vehículo *
            </label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-neutral-800 text-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Seleccionar tipo</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type} className="bg-neutral-700 text-white focus:bg-neutral-800">
                  {type}
                </option>
              ))}
            </select>
            {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Capacidad (personas) *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="50"
              className={`w-full px-3 py-2 border rounded-md text-white/80 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.capacity ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: 5"
            />
            {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Precio por Día ($) *
            </label>
            <input
              type="number"
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md text-white/80 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pricePerDay ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: 50.00"
            />
            {errors.pricePerDay && <p className="text-red-500 text-sm mt-1">{errors.pricePerDay}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Kilómetros Actuales *
            </label>
            <input
              type="number"
              name="kilometers"
              value={formData.kilometers}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md text-white/80 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.kilometers ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: 15000"
            />
            {errors.kilometers && <p className="text-red-500 text-sm mt-1">{errors.kilometers}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Kilómetros para Mantenimiento *
            </label>
            <input
              type="number"
              name="kmForMaintenance"
              value={formData.kmForMaintenance}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md text-white/80 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.kmForMaintenance ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: 20000"
            />
            {errors.kmForMaintenance && <p className="text-red-500 text-sm mt-1">{errors.kmForMaintenance}</p>}
          </div>
        </div>

        {/* Características */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Características *
          </label>
          <textarea
            name="featuresText"
            value={formData.featuresText || ''}
            onChange={handleFeaturesChange}
            rows="3"
            className={`w-full px-3 py-2 border rounded-md text-white/80 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.features ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Ej: Aire acondicionado, Bluetooth, GPS, Cámara trasera (separar con comas)"
          />
          <p className="text-sm text-gray-500 mt-1">Separa las características con comas</p>
          {errors.features && <p className="text-red-500 text-sm mt-1">{errors.features}</p>}

          {/* Preview de características */}
          {formData.features && formData.features.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full border border-blue-500/30"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Número telefónico de la aseguradora *
          </label>
          <input
            type="tel"
            name="insurancePhone"
            value={formData.insurancePhone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-white/80 bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.insurancePhone ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Ej: +503 1234-5678"
          />
          {errors.insurancePhone && <p className="text-red-500 text-sm mt-1">{errors.insurancePhone}</p>}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 cursor-pointer py-2 border border-gray-300 rounded-md text-gray-200 hover:bg-gray-50 hover:text-gray-700"
            disabled={submitLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="cursor-pointer px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLoading ? 'Creando...' : 'Crear Vehículo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVehicleForm;
