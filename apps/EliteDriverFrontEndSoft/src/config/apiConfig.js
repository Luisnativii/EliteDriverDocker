// config/apiConfig.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Configuración de endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VALIDATE: '/auth/validate'
  },
  VEHICLES: {
    GET_ALL: '/vehicles',           // GET /api/vehicles
    GET_BY_ID: '/vehicles/:id',     // GET /api/vehicles/:id
    CREATE: '/vehicles',            // POST /api/vehicles
    UPDATE: '/vehicles/:id',        // PUT /api/vehicles/:id
    DELETE: '/vehicles/:id'         // DELETE /api/vehicles/:id
  },
  RESERVATIONS: {
    GET_ALL: '/reservations',                    // GET /api/reservations
    GET_BY_USER: '/reservations/user',   // GET /api/reservations/user/:userId
    CREATE: '/reservations',                     // POST /api/reservations
    UPDATE: '/reservations/:id',                 // PUT /api/reservations/:id
    CANCEL: '/reservations/:id',           // DELETE /api/reservations/:id/cancel
    GET_BY_DATE: '/reservations/date?startDate=:startDate&endDate=:endDate'  // GET /api/reservations/date?StartDate=date&EndDate=date
  }
};

// Configuración adicional para desarrollo
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Headers comunes
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Función de utilidad para construir URLs con parámetros
export const buildEndpoint = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Reemplazar parámetros en la URL
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Ejemplo de uso:
// buildEndpoint(API_ENDPOINTS.VEHICLES.GET_BY_ID, { id: '123' })
// Resultado: '/vehicles/123'