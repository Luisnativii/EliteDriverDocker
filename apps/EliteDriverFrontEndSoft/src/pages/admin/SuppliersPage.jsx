import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSuppliers, saveSupplier, deleteSupplier } from '../../services/adminService';
import { useDialogFocus } from '../../hooks/useDialogFocus';

const empty = {name:'',phone:'',email:'',notes:''};
export default function SuppliersPage() {
  const navigate = useNavigate();
  const [suppliers,setSuppliers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [search,setSearch] = useState('');
  const [form,setForm] = useState(null);
  const [editing,setEditing] = useState(null);
  const [formError,setFormError] = useState('');
  const [busy,setBusy] = useState(false);
  const [deleteId,setDeleteId] = useState(null);
  const close = useCallback(() => { if (!busy) {setForm(null);setEditing(null);setFormError('');} },[busy]);
  const formRef = useDialogFocus(Boolean(form),close);
  const load = useCallback(async () => {
    try {setSuppliers(await getSuppliers());setError('');}
    catch(err) {setError(err.message);}
    finally {setLoading(false);}
  },[]);
  useEffect(() => {load();},[load]);
  const submit = async event => {
    event.preventDefault();setBusy(true);setFormError('');
    try {await saveSupplier(editing,form);setForm(null);setEditing(null);await load();}
    catch(err) {setFormError(err.message);}
    finally {setBusy(false);}
  };
  const remove = async id => {
    setBusy(true);setError('');
    try {await deleteSupplier(id);setDeleteId(null);await load();}
    catch(err) {setError(err.message);}
    finally {setBusy(false);}
  };
  const visible = suppliers.filter(s => [s.name,s.email,s.phone].join(' ').toLowerCase().includes(search.toLowerCase()));
  const control = 'w-full min-h-11 rounded-lg bg-neutral-800 border border-white/30 px-3 text-white';
  return <main className="pt-24 pb-10 px-4 sm:px-6 text-white max-w-7xl mx-auto space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-3"><div><h1 className="text-2xl font-bold">Proveedores</h1><p className="text-white/60 mt-1">Controla a quién pertenece cada vehículo de la flota.</p></div>
      <button onClick={() => {setEditing(null);setForm({...empty});setFormError('');}} className="min-h-11 px-5 rounded-lg bg-red-600 font-semibold">Agregar proveedor</button></div>
    <div className="grid grid-cols-2 gap-3"><div className="p-4 rounded-xl border border-white/15 bg-white/5"><p className="text-white/60 text-sm">Proveedores</p><strong className="text-2xl">{suppliers.length}</strong></div><div className="p-4 rounded-xl border border-white/15 bg-white/5"><p className="text-white/60 text-sm">Vehículos de proveedores</p><strong className="text-2xl">{suppliers.reduce((n,s)=>n+s.vehicleCount,0)}</strong></div></div>
    <p className="text-sm text-white/60">Los vehículos sin proveedor asignado se consideran propios. Puedes cambiar su propietario al crearlos o editarlos.</p>
    <label className="block text-sm">Buscar proveedor<input className={control+' mt-1'} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre, teléfono o correo"/></label>
    {error && <div role="alert" className="p-4 bg-red-500/15 rounded-lg text-red-200">{error}<button onClick={load} className="min-h-11 underline ml-3">Actualizar</button></div>}
    {loading ? <p>Cargando proveedores…</p> : visible.length===0 ? <p className="py-6 text-white/60">No hay proveedores para mostrar.</p> : <ul className="grid md:grid-cols-2 gap-4">{visible.map(s => <li key={s.id} className="rounded-xl border border-white/15 bg-white/5 p-5 space-y-3">
      <h2 className="font-semibold text-lg break-words">{s.name}</h2><p className="text-sm text-white/70 break-words">{s.phone || 'Sin teléfono'} · {s.email || 'Sin correo'}</p>{s.notes && <p className="text-sm text-white/60 break-words">{s.notes}</p>}
      <button onClick={()=>navigate('/admin/vehicle',{state:{supplierFilter:s.id}})} className="min-h-11 underline">Ver vehículos ({s.vehicleCount})</button>
      <div className="flex flex-wrap gap-3"><button className="min-h-11 px-4 border border-white/30 rounded-lg" onClick={()=>{setEditing(s.id);setForm({name:s.name,phone:s.phone||'',email:s.email||'',notes:s.notes||''});setFormError('');}}>Editar</button>
        {deleteId===s.id ? <><button disabled={busy} className="min-h-11 px-4 bg-red-700 rounded-lg disabled:opacity-50" onClick={()=>remove(s.id)}>Confirmar eliminación</button><button className="min-h-11 underline" onClick={()=>setDeleteId(null)}>Cancelar</button></> : <button disabled={busy} className="min-h-11 px-4 text-red-300 disabled:opacity-50" onClick={()=>setDeleteId(s.id)}>Eliminar</button>}
      </div></li>)}</ul>}
    {form && <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center"><div ref={formRef} role="dialog" aria-modal="true" aria-labelledby="supplier-title" tabIndex={-1} className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-neutral-900 border border-white/20 p-5">
      <div className="flex justify-between items-center mb-4"><h2 id="supplier-title" className="text-xl font-bold">{editing ? 'Editar proveedor' : 'Agregar proveedor'}</h2><button disabled={busy} onClick={close} className="min-h-11 min-w-11" aria-label="Cerrar proveedor">✕</button></div>
      <form onSubmit={submit} className="space-y-4">{[['name','Nombre',120,'text'],['phone','Teléfono',40,'tel'],['email','Correo',150,'email']].map(([field,label,max,type])=><label key={field} className="block text-sm">{label}{field==='name'?' *':''}<input required={field==='name'} maxLength={max} type={type} value={form[field]} disabled={busy} onChange={e=>setForm({...form,[field]:e.target.value})} className={control+' mt-1'}/></label>)}
        <label className="block text-sm">Notas internas<textarea maxLength={500} disabled={busy} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className={control+' mt-1 py-2'}/></label>
        {formError && <p role="alert" className="text-red-200">{formError}</p>}
        <button type="submit" disabled={busy} className="w-full min-h-11 rounded-lg bg-red-600 font-semibold disabled:opacity-50">{busy?'Guardando…':'Guardar proveedor'}</button>
      </form></div></div>}
  </main>;
}
