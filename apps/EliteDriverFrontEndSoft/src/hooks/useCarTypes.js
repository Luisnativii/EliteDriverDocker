// Hook para obtener tipos de vehículos

/**
 * Hook personalizado para obtener los tipos de vehículos desde la API.
 * Este hook maneja el estado de carga, error y los datos de los tipos de vehículos.
 * 
 * @returns {Object} - El hook devuelve un objeto con los siguientes valores:
 *    - carTypes: Un array de tipos de vehículos obtenidos de la API (o por defecto).
 *    - loading: Un estado booleano que indica si la solicitud está en curso.
 *    - error: Un mensaje de error si la solicitud falla, o null si no hay error.
 *    - refetch: Una función para volver a realizar la solicitud de los tipos de vehículos.
 */

export const useCarTypes = () => {
  const [carTypes, setCarTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCarTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ajusta esta URL según tu endpoint de tipos de vehículos
      const response = await vehicleApi.get('/car-types'); // o '/cartypes' según tu API
      
      if (!Array.isArray(response.data)) {
        throw new Error('La respuesta no es un array válido');
      }
      
      setCarTypes(response.data);

    } catch (err) {
      let errorMessage;
      if (err.response?.status === 403) {
        errorMessage = 'No tienes permisos para ver los tipos de vehículos.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (err.response?.status === 404) {
        // Si no existe el endpoint, usar datos por defecto
        setCarTypes([
          { type: 'Sedán' },
          { type: 'SUV' },
          { type: 'Hatchback' },
        ]);
        setError(null);
        setLoading(false);
        return;
      } else {
        errorMessage = err.response?.data?.message || 
                      err.message || 
                      'Error al cargar los tipos de vehículos';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarTypes();
  }, []);

  return { 
    carTypes, 
    loading, 
    error, 
    refetch: fetchCarTypes 
  };
};