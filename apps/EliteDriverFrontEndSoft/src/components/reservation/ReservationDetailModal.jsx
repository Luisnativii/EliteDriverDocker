import React from 'react';
import { X } from 'lucide-react';

const ReservationDetailModal = ({ isOpen, onClose, reservation, formatDate, formatPrice }) => {
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full text-white relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Detalle de Reserva</h2>

        <div className="space-y-2 text-sm">
          <p><strong>ID:</strong> {reservation.id}</p>
          <p><strong>Usuario:</strong> {reservation.user.name}</p>
          <p><strong>Email:</strong> {reservation.user.email}</p>
          <p><strong>DUI:</strong> {reservation.user.dui}</p>
          <p><strong>Vehículo:</strong> {reservation.vehicle.name}</p>
          <p><strong>Marca/Modelo:</strong> {reservation.vehicle.brand} {reservation.vehicle.model}</p>
          <p><strong>Tipo:</strong> {reservation.vehicle.type}</p>
          <p><strong>Capacidad:</strong> {reservation.vehicle.capacity} personas</p>
          <p><strong>Fecha de inicio:</strong> {formatDate(reservation.startDate)}</p>
          <p><strong>Fecha de fin:</strong> {formatDate(reservation.endDate)}</p>
          <p><strong>Precio total:</strong> {formatPrice(reservation.totalPrice)}</p>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;
