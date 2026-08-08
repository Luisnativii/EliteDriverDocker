// services/vehicleService.js
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';

// Configurar axios instance para vehículos
const vehicleApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para requests - agregar token si existe
vehicleApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken') ||
      localStorage.getItem('authToken') ||
      window.authToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores globalmente
vehicleApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      localStorage.removeItem('userData');
    }

    return Promise.reject(error);
  }
);

// Función para transformar datos de la API al formato del frontend
const transformVehicleData = (apiVehicle) => {
  return {
    id: apiVehicle.id,
    name: apiVehicle.name,
    brand: apiVehicle.brand,
    model: apiVehicle.model,
    capacity: apiVehicle.capacity,
    type: apiVehicle.vehicleType?.type || 'Desconocido',
    vehicleType: apiVehicle.vehicleType?.type || 'Desconocido',
    price: parseFloat(apiVehicle.pricePerDay),
    pricePerDay: parseFloat(apiVehicle.pricePerDay),
    kilometers: apiVehicle.kilometers,
    kmForMaintenance: apiVehicle.kmForMaintenance || null,
    features: apiVehicle.features || [],
    mainImageBase64: apiVehicle.mainImageBase64 || null,
    listImagesBase64: apiVehicle.listImagesBase64 || [],
    status: apiVehicle.status || 'maintenanceCompleted',
    insurancePhone: apiVehicle.insurancePhone || '',
    createdAt: apiVehicle.createdAt ? new Date(apiVehicle.createdAt) : null,
    updatedAt: apiVehicle.updatedAt ? new Date(apiVehicle.updatedAt) : null,
    maintenanceRecords: apiVehicle.maintenanceRecords || []
  };
};

// Función para transformar datos del frontend al formato de la API
const transformVehicleForAPI = (vehicleData) => {
  // Procesar features de manera más robusta
  let processedFeatures = [];
  if (vehicleData.features) {
    if (Array.isArray(vehicleData.features)) {
      processedFeatures = vehicleData.features.filter(f => f && typeof f === 'string' && f.trim() !== '');
    } else if (typeof vehicleData.features === 'string') {
      processedFeatures = vehicleData.features.split(',').map(f => f.trim()).filter(f => f !== '');
    }
  }

  // Validar datos requeridos antes de crear el objeto
  const name = vehicleData.name?.toString().trim();
  const brand = vehicleData.brand?.toString().trim();
  const model = vehicleData.model?.toString().trim();
  const insurancePhone = vehicleData.insurancePhone?.toString().trim() || '';
  const capacity = parseInt(vehicleData.capacity);
  const pricePerDay = parseFloat(vehicleData.pricePerDay || vehicleData.price);
  const kilometers = parseInt(vehicleData.kilometers);
  const vehicleType = vehicleData.vehicleType || vehicleData.type;

  // Validar que todos los campos requeridos estén presentes
  if (!name || !brand || !model || isNaN(capacity) || isNaN(pricePerDay) || isNaN(kilometers) || !vehicleType) {
    throw new Error('Todos los campos son requeridos y deben tener valores válidos');
  }

  const apiData = {
    name,
    brand,
    model,
    capacity,
    pricePerDay,
    kilometers,
    insurancePhone,
    kmForMaintenance: parseInt(vehicleData.kmForMaintenance),
    features: processedFeatures,
    vehicleType: {
      type: vehicleType
    },
    mainImageBase64: vehicleData.mainImageBase64 || null,
    listImagesBase64: Array.isArray(vehicleData.listImagesBase64)
      ? vehicleData.listImagesBase64
      : [],

    status: 'maintenanceCompleted'  // Asignar estado por defecto
  };

  return apiData;
};

const transformVehicleForUpdate = (vehicleData) => {
  // Procesar features de manera más robusta
  let processedFeatures = [];
  if (vehicleData.features) {
    if (Array.isArray(vehicleData.features)) {
      processedFeatures = vehicleData.features.filter(f => f && typeof f === 'string' && f.trim() !== '');
    } else if (typeof vehicleData.features === 'string') {
      processedFeatures = vehicleData.features.split(',').map(f => f.trim()).filter(f => f !== '');
    }
  }

  // Crear objeto de actualización solo con los campos que se están actualizando
  const updateData = {};

  // Solo agregar campos si están presentes en vehicleData
  if (vehicleData.hasOwnProperty('pricePerDay') || vehicleData.hasOwnProperty('price')) {
    const pricePerDay = parseFloat(vehicleData.pricePerDay || vehicleData.price);
    if (!isNaN(pricePerDay)) {
      updateData.pricePerDay = pricePerDay;
    }
  }

  if (vehicleData.hasOwnProperty('kilometers')) {
    const kilometers = parseInt(vehicleData.kilometers);
    if (!isNaN(kilometers)) {
      updateData.kilometers = kilometers;
    }
  }

  if (vehicleData.hasOwnProperty('kmForMaintenance')) {
    const kmForMaintenance = parseInt(vehicleData.kmForMaintenance);
    if (!isNaN(kmForMaintenance)) {
      updateData.kmForMaintenance = kmForMaintenance;
    }
  }

  // Agregar features si están presentes
  if (vehicleData.hasOwnProperty('features')) {
    updateData.features = processedFeatures;
  }

  // Agregar imágenes si están presentes
  if (vehicleData.hasOwnProperty("mainImageBase64")) {
    updateData.mainImageBase64 = vehicleData.mainImageBase64 || null;
  }

  if (vehicleData.hasOwnProperty("listImagesBase64")) {
    updateData.listImagesBase64 = Array.isArray(vehicleData.listImagesBase64)
      ? vehicleData.listImagesBase64
      : [];
  }

  // Agregar estado si está presente
  if (vehicleData.hasOwnProperty('status')) {
    updateData.status = vehicleData.status;
  }

  if (vehicleData.hasOwnProperty('insurancePhone')) {
    updateData.insurancePhone = vehicleData.insurancePhone?.trim() || '';
  }

  // Verificar que al menos hay un campo para actualizar
  if (Object.keys(updateData).length === 0) {
    throw new Error('No se proporcionaron campos válidos para actualizar');
  }

  return updateData;
};

// Servicios principales
export const getAllVehicles = async () => {
  try {
    const response = await vehicleApi.get(API_ENDPOINTS.VEHICLES.GET_ALL);

    if (!Array.isArray(response.data)) {
      throw new Error('La respuesta no es un array válido');
    }

    const transformedVehicles = response.data.map(transformVehicleData);
    return transformedVehicles;

  } catch (error) {
    // Crear mensaje de error específico
    let errorMessage = 'Error al cargar los vehículos';

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.message || 'Petición incorrecta. Verifica la configuración de la API.';
          break;
        case 401:
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para ver los vehículos. Verifica tu autenticación.';
          break;
        case 404:
          errorMessage = 'Servicio de vehículos no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = data?.message || `Error del servidor (${status}).`;
      }
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica que esté ejecutándose.';
    } else {
      errorMessage = error.message || 'Error inesperado';
    }

    throw new Error(errorMessage);
  }
};

export const getVehicleById = async (id) => {
  try {
    const endpoint = API_ENDPOINTS.VEHICLES.GET_BY_ID.replace(':id', id);

    try {
      const response = await vehicleApi.get(endpoint);
      return transformVehicleData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        const allVehicles = await getAllVehicles();
        const foundVehicle = allVehicles.find(v => v.id === id);

        if (!foundVehicle) {
          throw new Error('Vehículo no encontrado');
        }

        return foundVehicle;
      }
      throw error;
    }

  } catch (error) {
    const errorMessage = error.response?.data?.message ||
      error.message ||
      'Error al cargar el vehículo';
    throw new Error(errorMessage);
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const apiData = transformVehicleForAPI(vehicleData);

    const response = await vehicleApi.post(API_ENDPOINTS.VEHICLES.CREATE, apiData);

    // Si el backend devuelve datos, transformarlos
    if (response.data) {
      return transformVehicleData(response.data);
    }

    // Si no devuelve datos, devolver los datos originales con un ID simulado
    return { ...vehicleData, id: 'created-successfully' };

  } catch (error) {
    let errorMessage = 'Error al crear el vehículo';

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.message || 'Datos inválidos. Verifica la información ingresada.';
          break;
        case 401:
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos de administrador para crear vehículos.';
          break;
        case 409:
          errorMessage = data?.message || 'Ya existe un vehículo con esos datos.';
          break;
        case 422:
          errorMessage = data?.message || 'Error de validación. Revisa los datos ingresados.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = data?.message || `Error del servidor (${status}).`;
      }
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica que esté ejecutándose.';
    } else {
      errorMessage = error.message || 'Error inesperado';
    }

    throw new Error(errorMessage);
  }
};

export const updateVehicle = async (id, updateData) => {
  try {
    const endpoint = API_ENDPOINTS.VEHICLES.UPDATE.replace(':id', id);

    // Usar la función específica para updates que solo envía campos permitidos
    const apiData = transformVehicleForUpdate(updateData);

    const response = await vehicleApi.put(endpoint, apiData);

    return response.data ? transformVehicleData(response.data) : { success: true };

  } catch (error) {
    let errorMessage = 'Error al actualizar el vehículo';

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.message || 'Datos inválidos para la actualización.';
          break;
        case 401:
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos de administrador para actualizar vehículos.';
          break;
        case 404:
          errorMessage = 'Vehículo no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = data?.message || `Error del servidor (${status}).`;
      }
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor.';
    } else {
      errorMessage = error.message || 'Error inesperado';
    }

    throw new Error(errorMessage);
  }
};

export const deleteVehicle = async (id) => {
  try {
    const endpoint = API_ENDPOINTS.VEHICLES.DELETE.replace(':id', id);
    await vehicleApi.delete(endpoint);

    return { success: true };

  } catch (error) {
    let errorMessage = 'Error al eliminar el vehículo';

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos de administrador para eliminar vehículos.';
          break;
        case 404:
          errorMessage = 'Vehículo no encontrado.';
          break;
        case 409:
          errorMessage = 'No se puede eliminar el vehículo porque tiene reservas asociadas.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = data?.message || `Error del servidor (${status}).`;
      }
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor.';
    } else {
      errorMessage = error.message || 'Error inesperado';
    }

    throw new Error(errorMessage);
  }
};

// Funciones de utilidad para autenticación
export const getCurrentUser = () => {
  const userData = sessionStorage.getItem('userData') ||
    localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
  return !!(sessionStorage.getItem('authToken') ||
    localStorage.getItem('authToken'));
};

export const hasAdminRole = () => {
  const user = getCurrentUser();
  return user && (user.role === 'ADMIN' || user.roles?.includes('ADMIN'));
};

export const getStatusLabel = (status) => {
  const statusLabels = {
    'reserved': 'Reservado',
    'underMaintenance': 'En Mantenimiento',
    'maintenanceRequired': 'Requiere Mantenimiento',
    'maintenanceCompleted': 'Disponible',
    'outOfService': 'Fuera de Servicio'
  };

  return statusLabels[status] || 'Estado Desconocido';
};

// Agregar función para obtener el color del estado
export const getStatusColor = (status) => {
  const statusColors = {
    'reserved': 'text-green-400 bg-green-500/20',
    'underMaintenance': 'text-orange-400 bg-orange-500/20',
    'maintenanceRequired': 'text-yellow-400 bg-yellow-500/20',
    'maintenanceCompleted': 'text-emerald-400 bg-emerald-500/20',
    'outOfService': 'text-red-400 bg-red-500/20'
  };

  return statusColors[status] || 'text-gray-400 bg-gray-500/20';
};