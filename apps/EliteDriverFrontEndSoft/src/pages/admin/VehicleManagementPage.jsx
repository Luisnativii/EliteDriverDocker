import React from 'react';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useVehicleManagement } from '../../hooks/useVehicleManagement';
import CreateVehicleForm from '../../components/forms/CreateVehicleForm';
import EditVehicleForm from '../../components/forms/EditVehicleForm';
import VehicleCard from '../../components/vehicle/VehicleCard';
import VehicleAvailabilityPanel from '../../components/vehicle/VehicleAvailabilityPanel';
import VehicleFilterForm from '../../components/forms/VehicleFilterForm';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { vehicleStatusLabels } from '../../utils/vehicleAvailability.js';
import { rentalToday } from '../../utils/rentalDates.js';

export default function VehicleManagementPage() {
  const state = useVehicleManagement();
  const { showForm, editingVehicle, handleCloseForm, handleRefresh } = state;
  const formRef = useDialogFocus(showForm, handleCloseForm);
  return <div className="min-h-screen bg-neutral-900 text-white pt-20 pb-8 px-4 sm:px-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <VehicleFilterForm searchTerm={state.searchTerm} setSearchTerm={state.setSearchTerm} filterType={state.filterType} setFilterType={state.setFilterType} uniqueTypes={state.uniqueTypes} hasAdminRole onAddVehicle={state.handleAddVehicle} onRefresh={handleRefresh}/>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">Consultar desde<input type="date" value={state.reservationDateFrom} onChange={e => state.setReservationDateFrom(e.target.value)} className="block min-h-11 px-3 bg-neutral-800 border border-white/30 rounded-lg"/></label>
        <label className="text-sm">Hasta<input type="date" min={state.reservationDateFrom} value={state.reservationDateTo} onChange={e => state.setReservationDateTo(e.target.value)} className="block min-h-11 px-3 bg-neutral-800 border border-white/30 rounded-lg"/></label>
        <button className="min-h-11 px-4 border border-white/30 rounded-lg" onClick={() => {state.setReservationDateFrom(rentalToday());state.setReservationDateTo(rentalToday());}}>Hoy</button>
      </div>
      <p className="text-sm text-white/60">Activa o desactiva vehículos, o programa períodos fuera de servicio. Las cifras muestran la disponibilidad para el rango consultado.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {['all','active','reserved','outOfService','inactive'].map(status => <button key={status} aria-pressed={state.statusFilter === status} onClick={() => state.setStatusFilter(status)} className={`text-left min-h-20 p-4 rounded-xl border ${state.statusFilter === status ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-white/5'}`}>
          <span className="text-sm text-white/70">{status === 'all' ? 'Total' : vehicleStatusLabels[status]}</span><strong className="block text-2xl">{state.statusCounts[status === 'all' ? 'total' : status]}</strong>
        </button>)}
      </div>
      {state.error && <p role="alert" className="p-4 rounded-xl bg-red-500/15 text-red-200">{state.error}</p>}
      {state.loading ? <LoadingSpinner/> : state.filteredVehicles.length === 0 ? <p className="py-8 text-white/70">No hay vehículos para estos filtros.</p> :
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{state.filteredVehicles.map(v => <div key={v.id} className="min-w-0 space-y-3">
          <VehicleCard vehicle={{...v,effectiveStatus:state.getEffectiveVehicleStatus(v),isReserved:state.getEffectiveVehicleStatus(v)==='reserved'}} onEdit={state.handleEditVehicle} onRefresh={handleRefresh} isAdmin/>
          <VehicleAvailabilityPanel vehicle={v} onChange={handleRefresh}/>
        </div>)}</div>}
      {showForm && <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div ref={formRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={editingVehicle ? 'Editar vehículo' : 'Agregar vehículo'} className="bg-neutral-900 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-white/20"><h2 className="text-xl font-bold">{editingVehicle ? 'Editar vehículo' : 'Agregar vehículo'}</h2><button onClick={handleCloseForm} className="min-h-11 min-w-11" aria-label="Cerrar">✕</button></div>
          <div className="p-4 min-h-0 overflow-y-auto">{editingVehicle ? <EditVehicleForm vehicle={editingVehicle} onSubmit={state.handleUpdateSubmit} onCancel={handleCloseForm} submitLoading={state.operationLoading}/> : <CreateVehicleForm onSubmit={state.handleCreateSubmit} onCancel={handleCloseForm} submitLoading={state.operationLoading}/>}</div>
        </div>
      </div>}
    </div>
  </div>;
}
