// hooks/useVehicles.js
import { useState, useEffect, useCallback } from 'react';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getCurrentUser,
  isAuthenticated,
  hasAdminRole
} from '../services/vehicleService';

/**
 * Hook para gestionar vehículos.
 * Permite obtener todos los vehículos, obtener un vehículo específico por ID,
 * crear, actualizar y eliminar vehículos, así como verificar si el usuario está autenticado y tiene permisos de administrador.
 * 
 * @returns {Object} - Datos y funciones para gestionar los vehículos.
 */

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const vehiclesData = await getAllVehicles();
      setVehicles(vehiclesData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles
  };
};

/**
 * Hook para obtener un vehículo específico por su ID.
 * 
 * @param {string} id - ID del vehículo a obtener.
 * @returns {Object} - Datos y funciones para obtener un vehículo específico.
 */
export const useVehicle = (id) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicle = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const vehicleData = await getVehicleById(id);
      setVehicle(vehicleData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  return {
    vehicle,
    loading,
    error,
    refetch: fetchVehicle
  };
};

/**
 * Hook para verificar la autenticación y los permisos del usuario.
 * 
 * @returns {Object} - Estado de autenticación y permisos del usuario.
 */
export const useAuthCheck = () => {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    hasAdminRole: false,
    userInfo: null,
    loading: true
  });

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const adminRole = hasAdminRole();
      const userInfo = getCurrentUser();

      setAuthStatus({
        isAuthenticated: authenticated,
        hasAdminRole: adminRole,
        userInfo: userInfo,
        loading: false
      });
    };

    checkAuth();
  }, []);

  return authStatus;
};

/**
 * Hook para realizar operaciones CRUD sobre los vehículos (crear, actualizar, eliminar).
 * 
 * @returns {Object} - Funciones y estados relacionados con las operaciones CRUD de los vehículos.
 */
export const useVehicleOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { hasAdminRole: userHasAdminRole } = useAuthCheck();

  // Función para crear vehículo
  const handleCreateVehicle = useCallback(async (vehicleData, onSuccess) => {
    try {
      setIsLoading(true);
      setErrors({});

      if (!userHasAdminRole) {
        throw new Error('No tienes permisos de administrador para crear vehículos');
      }

      const result = await createVehicle(vehicleData);

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(result);
      }

      return result;

    } catch (error) {
      setErrors({ create: error.message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userHasAdminRole]);

  // Función para actualizar vehículo
  const handleUpdateVehicle = useCallback(async (id, updateData, onSuccess) => {
    try {
      setIsLoading(true);
      setErrors({});

      if (!userHasAdminRole) {
        throw new Error('No tienes permisos de administrador para actualizar vehículos');
      }
      const result = await updateVehicle(id, updateData);

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(result);
      }

      return result;

    } catch (error) {
      setErrors({ update: error.message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userHasAdminRole]);

  // Función para eliminar vehículo
  const handleDeleteVehicle = useCallback(async (id, onSuccess) => {
    try {
      setIsLoading(true);
      setErrors({});

      if (!userHasAdminRole) {
        throw new Error('No tienes permisos de administrador para eliminar vehículos');
      }
      const result = await deleteVehicle(id);

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(result);
      }

      return result;

    } catch (error) {
      setErrors({ delete: error.message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userHasAdminRole]);

  // Función para limpiar errores
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    // Funciones de operaciones
    createVehicle: handleCreateVehicle,
    updateVehicle: handleUpdateVehicle,
    deleteVehicle: handleDeleteVehicle,

    // Estado
    isLoading,
    errors,
    hasAdminRole: userHasAdminRole,

    // Utilidades
    clearErrors,
    setErrors
  };
};
