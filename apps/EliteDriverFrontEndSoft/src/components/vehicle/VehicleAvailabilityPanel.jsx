import React, { useState } from 'react';
import { updateVehicle, addVehicleUnavailability, removeVehicleUnavailability } from '../../services/vehicleService';
import { rentalToday } from '../../utils/rentalDates.js';

export default function VehicleAvailabilityPanel({ vehicle, onChange }) {
  const [startDate, setStart] = useState('');
  const [endDate, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const run = async action => {
    setBusy(true); setError('');
    try { await action(); await onChange(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const periods = (vehicle.unavailablePeriods || []).filter(p => p.endDate >= rentalToday());
  const control = 'w-full min-h-11 bg-neutral-900 border border-white/30 rounded-lg px-3 text-white';
  return <section className="p-4 bg-white/5 rounded-xl border border-white/15 space-y-3" aria-label={`Disponibilidad de ${vehicle.name}`}>
    <label className="block text-sm text-white/80">Estado del vehículo
      <select aria-label={`Estado de ${vehicle.name}`} value={vehicle.status} disabled={busy} onChange={e => run(() => updateVehicle(vehicle.id, {status:e.target.value}))} className={control + ' mt-1'}>
        <option value="active">Activo</option><option value="outOfService">Inactivo</option>
      </select>
    </label>
    <button type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded} className="min-h-11 w-full text-sm text-left underline text-white">Fuera de servicio por fechas ({periods.length})</button>
    {expanded && <div className="space-y-3">
      <p className="text-xs text-white/60">No se aceptan reservas durante estas fechas, incluyendo el día de inicio y de fin. Fuera del período, el vehículo activo vuelve a estar disponible.</p>
      {periods.length > 0 && <ul className="space-y-2">{periods.map(p => <li key={p.id} className="rounded-lg bg-black/20 p-3 text-sm">
        <p>{p.startDate} al {p.endDate}</p>{p.reason && <p className="text-white/60 break-words">{p.reason}</p>}
        <button type="button" disabled={busy} onClick={() => run(() => removeVehicleUnavailability(vehicle.id, p.id))} className="min-h-11 text-red-300 underline">Quitar período</button>
      </li>)}</ul>}
      <form onSubmit={e => { e.preventDefault(); run(async () => { await addVehicleUnavailability(vehicle.id, {startDate,endDate,reason}); setStart('');setEnd('');setReason(''); }); }} className="space-y-3">
        <label className="block text-sm">Desde<input aria-label={`Fuera de servicio desde: ${vehicle.name}`} required type="date" value={startDate} disabled={busy} onChange={e => {setStart(e.target.value); if (endDate && e.target.value > endDate) setEnd('');}} className={control}/></label>
        <label className="block text-sm">Hasta<input aria-label={`Fuera de servicio hasta: ${vehicle.name}`} required type="date" min={startDate || rentalToday()} value={endDate} disabled={busy} onChange={e => setEnd(e.target.value)} className={control}/></label>
        <label className="block text-sm">Motivo interno (opcional)<input maxLength={250} value={reason} disabled={busy} onChange={e => setReason(e.target.value)} className={control}/></label>
        <button type="submit" disabled={busy} className="min-h-11 w-full rounded-lg bg-red-600 px-3 font-medium disabled:opacity-50">{busy ? 'Guardando…' : 'Guardar período'}</button>
      </form>
    </div>}
    {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
  </section>;
}
