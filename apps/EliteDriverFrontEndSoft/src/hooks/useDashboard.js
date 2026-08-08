import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { vehicleService } from '../services/vehicleService';
import { reservationService } from '../services/reservationService';

/**
 * Hook personalizado para obtener los datos del dashboard.
 * Este hook maneja la carga de datos relacionados con las reservas, vehículos,
 * ingresos, mantenimiento y actividad reciente del sistema.
 * 
 * @returns {Object} - Retorna un objeto con el estado de carga, error, datos del dashboard y función para refrescar los datos.
 */

export const useDashboard = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    reservations: {
      total: 0,
      active: 0,
      upcoming: 0,
      completed: 0,
      todayReservations: [],
      weeklyTrend: []
    },
    vehicles: {
      total: 0,
      available: 0,
      reserved: 0,
      maintenance: 0,
      outOfService: 0,
      statusBreakdown: []
    },
    revenue: {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
      weeklyRevenue: []
    },
    maintenance: {
      requiresAttention: [],
      underMaintenance: [],
      scheduled: [],
      alerts: []
    },
    recentActivity: []
  });

  const hasAdminRole = user?.role === 'admin';

  /**
   * Función para obtener los datos de reservas.
   * Filtra y clasifica las reservas por su estado (activo, próximo, completado) y genera las tendencias semanales.
   * 
   * @returns {Object} - Datos de las reservas, incluyendo total, activo, próximo, completado y tendencias semanales.
   */

  const fetchReservationsData = useCallback(async () => {
    try {
      const reservations = await reservationService.getAllReservations();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Clasificar reservas por estado
      const active = reservations.filter(r => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return start <= now && end >= now;
      });

      const upcoming = reservations.filter(r => {
        const start = new Date(r.startDate);
        return start > now;
      });

      const completed = reservations.filter(r => {
        const end = new Date(r.endDate);
        return end < now;
      });

      // Reservas de hoy
      const todayReservations = reservations.filter(r => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return (start <= now && end >= today) || 
               (start >= today && start < new Date(today.getTime() + 24 * 60 * 60 * 1000));
      });

      // Tendencia semanal (últimos 7 días)
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        
        const dayReservations = reservations.filter(r => {
          const start = new Date(r.startDate);
          return start >= date && start < dateEnd;
        });

        weeklyTrend.push({
          date: date.toISOString().split('T')[0],
          count: dayReservations.length,
          revenue: dayReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0)
        });
      }

      return {
        total: reservations.length,
        active: active.length,
        upcoming: upcoming.length,
        completed: completed.length,
        todayReservations,
        weeklyTrend
      };
    } catch (error) {
      // console.error('Error fetching reservations data:', error);
      throw error;
    }
  }, []);

  /**
   * Función para obtener los datos de vehículos.
   * Clasifica los vehículos por su estado (disponible, reservado, en mantenimiento, fuera de servicio).
   * 
   * @returns {Object} - Datos de los vehículos, incluyendo total, disponible, reservado, mantenimiento, fuera de servicio y desglose por tipo.
   */
  const fetchVehiclesData = useCallback(async () => {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      const reservations = await reservationService.getAllReservations();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      // Obtener IDs de vehículos reservados hoy
      const todayReservedIds = new Set(
        reservations
          .filter(r => {
            const start = new Date(r.startDate);
            const end = new Date(r.endDate);
            return start < tomorrow && end >= today;
          })
          .map(r => r.vehicleId)
      );

      // Clasificar vehículos por estado
      const statusCounts = {
        total: vehicles.length,
        available: 0,
        reserved: 0,
        maintenance: 0,
        outOfService: 0
      };

      const statusBreakdown = [];

      vehicles.forEach(vehicle => {
        const isReserved = todayReservedIds.has(vehicle.id);
        
        if (isReserved) {
          statusCounts.reserved++;
        } else if (vehicle.maintenanceStatus === 'outOfService') {
          statusCounts.outOfService++;
        } else if (['underMaintenance', 'maintenanceRequired'].includes(vehicle.maintenanceStatus)) {
          statusCounts.maintenance++;
        } else {
          statusCounts.available++;
        }
      });

      // Breakdown por tipo de vehículo
      const typeBreakdown = vehicles.reduce((acc, vehicle) => {
        const type = vehicle.type || 'Sin especificar';
        if (!acc[type]) {
          acc[type] = { total: 0, available: 0, reserved: 0 };
        }
        acc[type].total++;
        
        if (todayReservedIds.has(vehicle.id)) {
          acc[type].reserved++;
        } else if (vehicle.maintenanceStatus === 'maintenanceCompleted') {
          acc[type].available++;
        }
        
        return acc;
      }, {});

      Object.entries(typeBreakdown).forEach(([type, data]) => {
        statusBreakdown.push({
          type,
          ...data
        });
      });

      return {
        ...statusCounts,
        statusBreakdown
      };
    } catch (error) {
      // console.error('Error fetching vehicles data:', error);
      throw error;
    }
  }, []);

  /**
   * Función para obtener los datos de ingresos.
   * Calcula los ingresos generados por las reservas completadas en diferentes períodos de tiempo (hoy, semana, mes, año).
   * 
   * @returns {Object} - Datos de los ingresos generados, incluyendo los ingresos de hoy, semana, mes, año y una tendencia semanal.
   */
  const fetchRevenueData = useCallback(async () => {
    try {
      const reservations = await reservationService.getAllReservations();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

      // Filtrar reservas completadas
      const completedReservations = reservations.filter(r => {
        const end = new Date(r.endDate);
        return end <= now;
      });

      // Calcular ingresos por período
      const todayRevenue = completedReservations
        .filter(r => {
          const end = new Date(r.endDate);
          return end >= today;
        })
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

      const weekRevenue = completedReservations
        .filter(r => {
          const end = new Date(r.endDate);
          return end >= weekAgo;
        })
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

      const monthRevenue = completedReservations
        .filter(r => {
          const end = new Date(r.endDate);
          return end >= monthAgo;
        })
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

      const yearRevenue = completedReservations
        .filter(r => {
          const end = new Date(r.endDate);
          return end >= yearAgo;
        })
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

      // Ingresos semanales (últimos 7 días)
      const weeklyRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        
        const dayRevenue = completedReservations
          .filter(r => {
            const end = new Date(r.endDate);
            return end >= date && end < dateEnd;
          })
          .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

        weeklyRevenue.push({
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue
        });
      }

      return {
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        year: yearRevenue,
        weeklyRevenue
      };
    } catch (error) {
      // console.error('Error fetching revenue data:', error);
      throw error;
    }
  }, []);

  /**
   * Función para obtener los datos de mantenimiento de los vehículos.
   * Filtra los vehículos según su estado de mantenimiento (requiere atención, en mantenimiento, fuera de servicio).
   * 
   * @returns {Object} - Datos de los vehículos que requieren atención, en mantenimiento y fuera de servicio, junto con las alertas.
   */

  const fetchMaintenanceData = useCallback(async () => {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      
      const requiresAttention = vehicles.filter(v => 
        v.maintenanceStatus === 'maintenanceRequired'
      );

      const underMaintenance = vehicles.filter(v => 
        v.maintenanceStatus === 'underMaintenance'
      );

      const outOfService = vehicles.filter(v => 
        v.maintenanceStatus === 'outOfService'
      );

      // Generar alertas basadas en el estado de los vehículos
      const alerts = [];

      if (requiresAttention.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Vehículos requieren revisión',
          message: `${requiresAttention.length} vehículo${requiresAttention.length > 1 ? 's' : ''} necesita${requiresAttention.length > 1 ? 'n' : ''} mantenimiento`,
          count: requiresAttention.length,
          action: 'maintenance'
        });
      }

      if (outOfService.length > 0) {
        alerts.push({
          type: 'error',
          title: 'Vehículos fuera de servicio',
          message: `${outOfService.length} vehículo${outOfService.length > 1 ? 's' : ''} fuera de servicio`,
          count: outOfService.length,
          action: 'maintenance'
        });
      }

      if (underMaintenance.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Vehículos en mantenimiento',
          message: `${underMaintenance.length} vehículo${underMaintenance.length > 1 ? 's' : ''} en proceso de mantenimiento`,
          count: underMaintenance.length,
          action: 'maintenance'
        });
      }

      return {
        requiresAttention,
        underMaintenance,
        scheduled: [], // Aquí puedes agregar mantenimientos programados si los tienes
        alerts
      };
    } catch (error) {
      // console.error('Error fetching maintenance data:', error);
      throw error;
    }
  }, []);

  /**
   * Función para obtener la actividad reciente del sistema.
   * Recupera las últimas reservas y las clasifica para mostrar como actividad reciente.
   * 
   * @returns {Array} - Lista de actividades recientes.
   */
  
  const fetchRecentActivity = useCallback(async () => {
    try {
      const reservations = await reservationService.getAllReservations();
      
      // Obtener las 10 reservas más recientes
      const recentReservations = reservations
        .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
        .slice(0, 10)
        .map(reservation => ({
          id: reservation.id,
          type: 'reservation',
          title: `Nueva reserva`,
          description: `${reservation.user.name} reservó ${reservation.vehicle.name}`,
          timestamp: reservation.createdAt || reservation.startDate,
          status: getDerivedStatus(reservation),
          user: reservation.user.name,
          vehicle: reservation.vehicle.name
        }));

      return recentReservations;
    } catch (error) {
      // console.error('Error fetching recent activity:', error);
      return [];
    }
  }, []);

  // Función auxiliar para determinar el estado de una reserva
  const getDerivedStatus = (reservation) => {
    const now = new Date();
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);

    if (start > now) return 'upcoming';
    if (start <= now && end >= now) return 'active';
    if (end < now) return 'completed';
    return 'unknown';
  };

  // Función principal para cargar todos los datos
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [reservationsData, vehiclesData, revenueData, maintenanceData, recentActivity] = await Promise.all([
        fetchReservationsData(),
        fetchVehiclesData(),
        fetchRevenueData(),
        fetchMaintenanceData(),
        fetchRecentActivity()
      ]);

      setDashboardData({
        reservations: reservationsData,
        vehicles: vehiclesData,
        revenue: revenueData,
        maintenance: maintenanceData,
        recentActivity
      });
    } catch (error) {
      // console.error('Error fetching dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [fetchReservationsData, fetchVehiclesData, fetchRevenueData, fetchMaintenanceData, fetchRecentActivity]);

  // Función para refrescar datos
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, fetchDashboardData]);

  return {
    loading,
    error,
    authLoading,
    isAuthenticated,
    hasAdminRole,
    dashboardData,
    handleRefresh
  };
};