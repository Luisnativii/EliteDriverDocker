import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useDateContext } from '../../context/DateContext';
import { getAllVehicles } from '../../services/vehicleService';
import ReservationService from '../../services/reservationService';
import { useAuth } from '../../hooks/useAuth';
import { goToReservation } from '../../utils/reservationNavigation.js';

/**
 * Vehículos que se pueden reservar ahora mismo, en la página de inicio.
 *
 * Reemplaza las imágenes estáticas por categoría que había antes: aquí se
 * listan los autos reales de la flota y, si ya hay fechas elegidas, se
 * descartan los que están reservados en ese rango.
 *
 * Mobile-first: una columna en celular, dos en tablet, tres en escritorio.
 */
const AvailableVehiclesSection = () => {
  const { startDate, endDate } = useDateContext();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [reservedIds, setReservedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [imgError, setImgError] = useState({});

  // Flota
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await getAllVehicles();
        if (!cancelado) setVehicles(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelado) setVehicles([]);
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  // Ocupación del rango elegido. Sin fechas no se filtra nada.
  const conFechas = Boolean(startDate && endDate && startDate < endDate);

  useEffect(() => {
    if (!conFechas) {
      setReservedIds([]);
      setAvailabilityError(null);
      return;
    }
    let cancelado = false;
    (async () => {
      try {
        const data = await ReservationService.getAvailability(startDate, endDate);
        if (cancelado) return;
        setReservedIds([...new Set((Array.isArray(data) ? data : []).map(r => r.vehicleId).filter(Boolean))]);
        setAvailabilityError(null);
      } catch {
        if (cancelado) return;
        setReservedIds([]);
        setAvailabilityError('No pudimos verificar la disponibilidad. Te mostramos toda la flota.');
      }
    })();
    return () => { cancelado = true; };
  }, [startDate, endDate, conFechas]);

  const precio = useMemo(() => {
    if (!conFechas) return null;
    return ReservationService.calculateTotalPrice(startDate, endDate, 1);
  }, [conFechas, startDate, endDate]);

  const disponibles = useMemo(() => {
    const aptos = vehicles.filter(v => (v.status || 'maintenanceCompleted') === 'maintenanceCompleted');
    const libres = aptos.filter(v => !reservedIds.includes(v.id));
    // Con rango elegido mostramos los que se pueden reservar ya; sin fechas,
    // priorizamos los que no están ocupados para no perder interest.
    const lista = conFechas ? libres : aptos.slice().sort(
      (a, b) => (reservedIds.includes(a.id) ? 1 : 0) - (reservedIds.includes(b.id) ? 1 : 0)
    );
    return lista;
  }, [vehicles, reservedIds, conFechas]);

  const visibles = disponibles.slice(0, 6);

  const irAlVehiculo = (id) => goToReservation(navigate, id, user);

  return (
    <section className="bg-neutral-800 text-white py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center mb-2">
          <div className="w-10 h-px bg-white mr-3" aria-hidden="true" />
          <h2 className="text-sm sm:text-base uppercase tracking-wide">Disponibles ahora</h2>
        </div>
        <p className="text-white/60 text-sm sm:text-base mb-6 sm:mb-10 max-w-2xl">
          {conFechas
            ? `Libres del ${startDate} al ${endDate} · ${precio?.days ?? 0} día(s). El precio ya incluye IVA.`
            : 'Elegí tus fechas arriba para ver cuáles están libres y cuánto salen.'}
        </p>

        {availabilityError && (
          <p className="text-amber-300 text-sm mb-4" role="status">{availabilityError}</p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : disponibles.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-white/70 mb-1">No hay vehículos disponibles para esas fechas.</p>
            <p className="text-white/50 text-sm mb-6">Prueba con otras fechas o mira toda la flota.</p>
            <Link
              to="/customer/vehicles"
              className="inline-flex items-center gap-2 min-h-11 px-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
            >
              Ver todos los vehículos
            </Link>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibles.map(v => {
                const ocupado = reservedIds.includes(v.id);
                const total = conFechas ? (v.pricePerDay || 0) * (precio?.days ?? 0) * 1.13 : null;
                return (
                  <li key={v.id} className="flex flex-col rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="aspect-[4/3] bg-neutral-900 overflow-hidden">
                      {v.mainImageUrl && !imgError[v.id] ? (
                        <img
                          src={v.mainImageUrl}
                          alt={v.name}
                          loading="lazy"
                          onError={() => setImgError(p => ({ ...p, [v.id]: true }))}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/25 text-4xl" aria-hidden="true">
                          <MapPin />
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-white/50 uppercase tracking-wide">{v.vehicleType}</p>
                      <h3 className="text-base font-semibold mt-0.5 mb-2 line-clamp-2">{v.name}</h3>

                      <div className="mt-auto">
                        <p className="text-white">
                          <span className="text-xl font-semibold">${(v.pricePerDay ?? 0).toFixed(2)}</span>
                          <span className="text-white/50 text-sm"> / día</span>
                        </p>
                        {conFechas && !ocupado && (
                          <p className="text-sm text-white/60 mt-0.5">
                            Total {precio?.days} día(s): <span className="text-white">${total.toFixed(2)}</span>
                          </p>
                        )}

                        {ocupado ? (
                          <p className="mt-3 text-center min-h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm">
                            No disponible en esas fechas
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => irAlVehiculo(v.id)}
                            className="mt-3 w-full min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-[0.98] transition"
                          >
                            Reservar
                            <ArrowRight size={16} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex justify-center">
              <Link
                to="/customer/vehicles"
                className="inline-flex items-center gap-2 min-h-11 px-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
              >
                Ver toda la flota
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AvailableVehiclesSection;
