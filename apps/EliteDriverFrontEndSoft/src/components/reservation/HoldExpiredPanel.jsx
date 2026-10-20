import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Car, ArrowRight, AlertTriangle } from 'lucide-react';

/**
 * Lo que ve la persona cuando su pre-reserva venció.
 *
 * Si el vehículo sigue libre puede volver a tomarlo con un botón que renueva la
 * ventana de pago. Si otro cliente ya lo tomó, se explica con calma y se
 * ofrecen modelos del mismo tipo que siguen disponibles para esas fechas.
 */
const HoldExpiredPanel = ({
  onRetry,
  onChooseAlternative,
  alternatives = [],
  loading = false,
  error = '',
  reservedName = '',
}) => {
  const navigate = useNavigate();
  const hayAlternativas = alternatives.length > 0;

  return (
    <div
      role="status"
      className="rounded-2xl border border-amber-400/40 bg-gradient-to-b from-amber-500/15 to-transparent p-4 sm:p-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
          <Clock size={20} className="text-amber-300" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-amber-100">Tu reserva quedó en pausa</h3>
          <p className="text-sm text-amber-100/80 mt-0.5">
            Se agotó el tiempo para pagar
            {reservedName ? ` y liberamos ${reservedName}` : ''}.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-200 bg-red-500/10 border border-red-400/30 rounded-lg p-2">
          {error}
        </p>
      )}

      {/* El auto sigue libre: se puede retomar sin perder fechas. */}
      {!hayAlternativas && (
        <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className="w-full min-h-12 cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 text-white font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          {loading ? 'Comprobando disponibilidad…' : 'Volver a reservar el vehículo'}
        </button>
      )}

      {/* Otro cliente lo tomó: se ofrecen modelos parecidos. */}
      {hayAlternativas && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-amber-100/90">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Ese vehículo ya lo tomó otra persona. Estos modelos del mismo tipo
              siguen libres para tus fechas:
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alternatives.map(v => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => onChooseAlternative(v)}
                  className="w-full h-full text-left rounded-xl bg-white/5 border border-white/10 hover:border-red-400/40 hover:bg-white/10 active:scale-[0.99] transition overflow-hidden"
                >
                  <div className="aspect-[16/9] bg-neutral-900">
                    {v.mainImageUrl && v.mainImageUrl !== 'null' ? (
                      <img
                        src={v.mainImageUrl}
                        alt={v.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/25">
                        <Car size={28} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-white/50 uppercase tracking-wide">
                        {v.vehicleType}
                      </p>
                      <p className="text-sm font-medium truncate">{v.name}</p>
                    </div>
                    <span className="shrink-0 text-sm whitespace-nowrap">
                      <strong>${Number(v.pricePerDay).toFixed(2)}</strong>
                      <span className="text-white/50 text-xs">/día · IVA incluido</span>
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => navigate('/customer/vehicles')}
            className="w-full min-h-12 cursor-pointer rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium inline-flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            Ver todos los vehículos
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HoldExpiredPanel;