// /hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook para acceder al contexto de autenticación.
 * 
 * Este hook utiliza 'useContext' para acceder al AuthContext y obtener el estado
 * y las funciones relacionadas con la autenticación, como el usuario actual, 
 * el estado de carga y las funciones de login, logout y actualización del usuario.
 * 
 * @returns {Object} - El valor del contexto de autenticación, que incluye:
 *    - user: El usuario autenticado (si existe).
 *    - loading: El estado de carga, indicando si se está verificando al usuario.
 *    - login: Función para autenticar un usuario.
 *    - logout: Función para cerrar sesión.
 *    - updateUser: Función para actualizar los datos del usuario.
 */

export const useAuth = () => useContext(AuthContext);
