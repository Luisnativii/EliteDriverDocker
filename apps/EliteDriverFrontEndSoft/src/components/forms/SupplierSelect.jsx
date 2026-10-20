import React from 'react';

export default function SupplierSelect({ value, onChange, suppliers = [], currentSupplier, loading, error }) {
  return <div>
    <label htmlFor="vehicle-supplier" className="block text-sm font-medium text-gray-200 mb-1">Propietario / proveedor (opcional)</label>
    <select id="vehicle-supplier" value={value || ''} disabled={loading} onChange={e => onChange(e.target.value)} className="w-full min-h-11 rounded-lg border border-white/30 bg-neutral-800 px-3 text-white">
      <option value="">Propio</option>
      {value && !suppliers.some(s => s.id === value) && <option value={value}>{currentSupplier?.name || 'Proveedor actual'}</option>}
      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
    <p className="text-xs text-white/60 mt-1">Sin proveedor seleccionado, el vehículo pertenece a Elite Driver.</p>
    {error && <p role="alert" className="text-sm text-amber-200 mt-1">{error}</p>}
  </div>;
}
