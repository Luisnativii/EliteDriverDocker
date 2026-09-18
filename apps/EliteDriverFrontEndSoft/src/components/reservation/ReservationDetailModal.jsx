import { useEffect, useRef } from 'react';
import { paymentLabels, paymentStatus } from '../../utils/reservationStatus';
import { X } from 'lucide-react';

const ReservationDetailModal = ({ isOpen, onClose, reservation, formatDate, formatPrice }) => {
  const closeButton = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    closeButton.current?.focus();
    const onKey = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [isOpen, onClose]);
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
      <div role="dialog" aria-modal="true" aria-labelledby="reservation-detail-title" className="bg-neutral-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto break-words text-white relative">
        <button
          ref={closeButton}
          aria-label="Cerrar detalle de reserva"
          onClick={onClose}
          className="absolute min-h-11 min-w-11 flex items-center justify-center top-2 right-2 text-white/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="reservation-detail-title" className="text-xl font-bold mb-4 pr-8">Detalle de Reserva</h2>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-amber-200">{paymentLabels[paymentStatus(reservation)]}</p>
          <p><strong>ID:</strong> {reservation.id}</p>
          <p><strong>Usuario:</strong> {reservation.user.name}</p>
          <p className="break-all"><strong>Email:</strong> {reservation.user.email}</p>
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
