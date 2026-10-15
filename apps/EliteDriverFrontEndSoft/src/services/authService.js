// services/authService.js
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';

// Configurar axios instance
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para requests - agregar token si existe
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Función para iniciar sesión de usuario
 * @param {Object} credentials - Datos de autenticación del usuario (email, contraseña)
 * @returns {Object} Datos del usuario y token de autenticación
 */

export const login = async (credentials) => {
  try {
    const response = await authApi.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Verificar que la respuesta tenga el formato esperado
    if (response.data && response.data.token && response.data.user) {
      // Guardar token y datos del usuario
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      return response.data;
    } else {
      throw new Error('Formato de respuesta inválido del servidor');
    }
    
  } catch (error) {
    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un error. Su cuerpo es `{ error }`, no `{ message }`.
      const message = error.response.data?.error || error.response.data?.message || 'No se pudo iniciar sesión. Intenta nuevamente.';
      throw new Error(message);
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      throw new Error('No se pudo conectar con el servidor. Verifica que esté ejecutándose.');
    } else {
      // Error en la configuración de la petición
      throw new Error(error.message || 'Error inesperado');
    }
  }
};

/**
 * Función para registrar un nuevo usuario
 * @param {Object} userData - Datos del usuario para el registro
 * @returns {Object} Respuesta de la API con los datos del usuario registrado
 */

export const register = async (userData) => {
  try {
    const response = await authApi.post(API_ENDPOINTS.AUTH.REGISTER, userData, {
        headers: {
            'Content-Type': 'application/json'
            // NO incluir Authorization aquí
        }
    });
    return response.data;
    
  } catch (error) {
    // Crear mensaje de error específico basado en el código de estado
    let errorMessage = 'Error al registrar usuario. Intenta nuevamente.';
    
    if (error.response) {
      const { status, data } = error.response;
      // El backend responde `{ error, fields }`, nunca `message`.
      const serverMessage = data?.error || data?.message;
      // Los errores por campo (validación del DTO) llegan aquí y deben conservarse
      // para que el formulario los muestre junto al input correspondiente.
      const fields = data?.fields && typeof data.fields === 'object' ? data.fields : undefined;
      
      switch (status) {
        case 403:
          // Forbidden - puede ser por varios motivos
          errorMessage = serverMessage || 'Acceso denegado. Verifica que todos los datos sean correctos.';
          break;
          
        case 400:
          errorMessage = serverMessage || 'Datos inválidos. Verifica la información ingresada.';
          break;
          
        case 409:
          errorMessage = serverMessage || 'El usuario ya existe. Intenta con otro email o DUI.';
          break;
          
        case 422:
          errorMessage = serverMessage || 'Error de validación. Revisa los datos ingresados.';
          break;
          
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
          
        default:
          errorMessage = serverMessage || `Error del servidor (${status}).`;
      }

      const failure = new Error(errorMessage);
      failure.fields = fields;
      throw failure;
    }
    
    if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica que esté ejecutándose.');
    }
    
    throw new Error(error.message || 'Error inesperado');
  }
};

/**
 * Función para cerrar sesión
 */

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = '/'; //redirigir al homepage en vez del login
};

/**
 * Función para obtener los datos del usuario actual desde el localStorage
 * @returns {Object|null} Datos del usuario si está autenticado, null si no
 */

export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Función para verificar si el usuario está autenticado
 * @returns {boolean} True si el usuario está autenticado, false si no
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Función para validar el token de autenticación
 * @returns {boolean} True si el token es válido, false si no
 */

export const validateToken = async () => {
  try {
    const response = await authApi.get(API_ENDPOINTS.AUTH.VALIDATE);
    return response.data.valid;
  } catch (error) {
    return false;
  }
};
