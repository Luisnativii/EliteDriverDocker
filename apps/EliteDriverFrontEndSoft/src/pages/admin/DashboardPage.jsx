import React from 'react';

import MaintenanceAlerts from '../../components/admin/MaintenanceAlerts';
import ReservationCalendar from "../../components/admin/ReservationCalendar";


const DashboardPage = () => {
     return (
    <div className="mt-20 grid grid-cols-1 lg:flex gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Sección de Alertas */}
      <div className="w-full lg:w-80 lg:shrink-0 min-w-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-md">
        <h2 className="text-xl font-semibold text-white mb-4">Alertas de Mantenimiento</h2>
        <MaintenanceAlerts />
      </div>

      {/* Sección de Calendario */}
      <div className="w-full min-w-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-md">
        <h2 className="text-xl font-semibold text-white mb-4">Calendario de reservas</h2>
        <p className="text-sm text-white/60 mb-4">Cada reserva confirmada ocupa su vehículo en verde, azul o amarillo según si está activa, completada o próxima. Las pendientes de pago aparecen punteadas y se liberan solas al vencer.</p>
        <ReservationCalendar />
      </div>
    </div>
  );
}

export default DashboardPage;