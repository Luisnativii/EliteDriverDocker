import React from 'react';
import ReservationCalendar from '../../components/admin/ReservationCalendar';

export default function DashboardPage() {
  return <div className="mt-20 p-4 sm:p-6">
    <section className="min-w-0 bg-white/10 rounded-xl p-4 border border-white/20">
      <h1 className="text-xl font-semibold text-white mb-4">Calendario de reservas</h1>
      <p className="text-sm text-white/60 mb-4">Las reservas confirmadas y las pendientes se muestran aquí. Administra el estado de la flota y sus períodos fuera de servicio en Gestión de Vehículos.</p>
      <ReservationCalendar />
    </section>
  </div>;
}
