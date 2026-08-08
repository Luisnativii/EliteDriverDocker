import React from 'react';

import MaintenanceAlerts from '../../components/admin/MaintenanceAlerts';
import ReservationCalendar from "../../components/admin/ReservationCalendar";


const DashboardPage = () => {
     return (
    <div className="mt-16 grid grid-cols-1 lg:flex gap-6 p-6">
      {/* Sección de Alertas */}
      <div className="w-80 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-md">
        <h2 className="text-xl font-semibold text-white mb-4">Alertas de Mantenimiento</h2>
        <MaintenanceAlerts />
      </div>

      {/* Sección de Calendario */}
      <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-md">
        <h2 className="text-xl font-semibold text-white mb-4">Calendario de Reservas</h2>
        <ReservationCalendar />
      </div>
    </div>
  );
}

export default DashboardPage;