// utils/roleMapping.js

/**
 * Mapeo de roles de base de datos a roles de frontend
 */
const DB_TO_FRONTEND_ROLES = {
  'ADMIN': 'admin',
  'CUSTOMER': 'customer',
  'USER': 'customer', // Por si acaso también tienes USER
};

/**
 * Mapeo de roles de frontend a roles de base de datos
 */
const FRONTEND_TO_DB_ROLES = {
  'admin': 'ADMIN',
  'customer': 'CUSTOMER',
};

/**
 * Mapeo de roles de base de datos a roles para las opciones de menú
 */
const DB_TO_MENU_ROLES = {
  'ADMIN': 'ADMIN',
  'CUSTOMER': 'USER',
  'USER': 'USER',
};

/**
 * Convierte un rol de base de datos a rol de frontend
 * @param {string} dbRole - Rol de la base de datos (ADMIN, CUSTOMER, etc.)
 * @returns {string} - Rol de frontend (admin, customer)
 */
export const dbRoleToFrontend = (dbRole) => {
  if (!dbRole) return 'customer'; // Rol por defecto
  return DB_TO_FRONTEND_ROLES[dbRole.toUpperCase()] || 'customer';
};

/**
 * Convierte un rol de frontend a rol de base de datos
 * @param {string} frontendRole - Rol de frontend (admin, customer)
 * @returns {string} - Rol de base de datos (ADMIN, CUSTOMER)
 */
export const frontendRoleToDb = (frontendRole) => {
  if (!frontendRole) return 'CUSTOMER'; // Rol por defecto
  return FRONTEND_TO_DB_ROLES[frontendRole.toLowerCase()] || 'CUSTOMER';
};

/**
 * Convierte un rol de base de datos a rol para opciones de menú
 * @param {string} dbRole - Rol de la base de datos (ADMIN, CUSTOMER, etc.)
 * @returns {string} - Rol para menú (ADMIN, USER)
 */
export const dbRoleToMenu = (dbRole) => {
  if (!dbRole) return 'USER'; // Rol por defecto
  return DB_TO_MENU_ROLES[dbRole.toUpperCase()] || 'USER';
};

/**
 * Verifica si un usuario tiene un rol específico
 * @param {Object} user - Objeto usuario
 * @param {string} requiredRole - Rol requerido (formato frontend: admin, customer)
 * @returns {boolean} - true si el usuario tiene el rol requerido
 */
export const hasRole = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  const userFrontendRole = dbRoleToFrontend(user.role);
  return userFrontendRole === requiredRole;
};

/**
 * Obtiene el rol de ruta del usuario (formato frontend)
 * @param {Object} user - Objeto usuario
 * @returns {string} - Rol de ruta (admin, customer)
 */
export const getUserRouteRole = (user) => {
  if (!user || !user.role) return 'customer';
  return dbRoleToFrontend(user.role);
};