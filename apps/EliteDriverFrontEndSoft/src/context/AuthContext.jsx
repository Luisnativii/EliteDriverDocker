// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserRouteRole } from '../utils/roleMapping';

const AuthContext = createContext();

/**
 * Proveedor de contexto para la autenticación.
 * Este componente envuelve a otros componentes para proporcionar
 * el estado de autenticación (usuario, estado de carga) y funciones 
 * relacionadas (login, logout, updateUser) a través del contexto.
 *
 * @param {Object} children - Componentes hijos que necesitan acceso al contexto.
 */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);        // Estado para el usuario autenticado
  const [loading, setLoading] = useState(true);  // Estado de carga para mostrar la UI mientras se recupera el usuario


  useEffect(() => {
    // Cargar el usuario desde localStorage (usando las claves de authService)
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Obtener el token de autenticación de localStorage
        if (token) {
          const userData = JSON.parse(localStorage.getItem('userData')); // Obtener los datos del usuario de localStorage
          
          if (userData) {
            // Agregar 'routeRole' usando la utilidad 'getUserRouteRole' para determinar el rol de la ruta del usuario
            const userWithRouteRole = {
              ...userData,
              routeRole: getUserRouteRole(userData), // Determinar el rol de ruta del usuario
              isAuthenticated: true // Marcar al usuario como autenticado
            };
            
            setUser(userWithRouteRole); // Establecer el usuario en el estado
          }
        }
      } catch (error) {
        // console.error('Error loading user:', error);
        localStorage.removeItem('authToken'); 
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Función para realizar el login y actualizar el contexto de autenticación.
   * 
   * @param {Object} authData - Datos de autenticación (generalmente proporcionados por el backend después de un login exitoso)
   * @returns {Object} - Resultado con éxito o error del login
   */

  const login = async (authData) => {
    try {
      // Si los datos de autenticación son válidos, actualizar el estado del usuario
      if (authData && authData.user) {
        const userWithRouteRole = {
          ...authData.user,
          routeRole: getUserRouteRole(authData.user),
          isAuthenticated: true
        };

        setUser(userWithRouteRole);
        return { success: true, user: userWithRouteRole };
      } else {
        return { success: false, error: 'Invalid auth data' };
      }
    } catch (error) {
      return { success: false, error: 'Error updating context' };
    }
  };

  /**
   * Función para realizar logout y limpiar los datos del usuario del contexto y localStorage.
   */

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  /**
   * Función para actualizar los datos del usuario en el contexto y localStorage.
   *
   * @param {Object} updatedUserData - Nuevos datos del usuario para actualizar
   */

  const updateUser = (updatedUserData) => {
    const userWithRouteRole = {
      ...updatedUserData,
      routeRole: getUserRouteRole(updatedUserData),
      isAuthenticated: true
    };
    
    localStorage.setItem('userData', JSON.stringify(userWithRouteRole));
    setUser(userWithRouteRole);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context so useAuth can import it
export { AuthContext };