import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCustomers, getCustomerHistory } from '../../services/adminService';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { rentalToday } from '../../utils/rentalDates.js';
import { currentBusinessMonth, shiftMonth, pendingHolds, customerPriority, countdownText, rentalLabel } from '../../utils/customerManagement.js';

const dateTime = value => value ? new Intl.DateTimeFormat('es-SV',{dateStyle:'medium',timeStyle:'short',timeZone:'America/El_Salvador'}).format(new Date(value)) : 'No registrado';
const money = value => new Intl.NumberFormat('es-SV',{style:'currency',currency:'USD'}).format(value || 0);
function Pager({page,total,size,onChange}) {
  const pages=Math.max(1,Math.ceil(total/size));
  return <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{total} resultado(s) · Página {page+1} de {pages}</span><div className="flex gap-2"><button disabled={page===0} onClick={()=>onChange(page-1)} className="min-h-11 px-4 border border-white/20 rounded-lg disabled:opacity-40">Anterior</button><button disabled={page+1>=pages} onClick={()=>onChange(page+1)} className="min-h-11 px-4 border border-white/20 rounded-lg disabled:opacity-40">Siguiente</button></div></div>;
}
export default function CustomersPage() {
  const currentMonth=currentBusinessMonth();
  const [month,setMonth]=useState(currentMonth);
  const [search,setSearch]=useState('');
  const [query,setQuery]=useState('');
  const [page,setPage]=useState(0);
  const [data,setData]=useState(null);
  const [error,setError]=useState('');
  const [refresh,setRefresh]=useState(0);
  const [offset,setOffset]=useState(0);
  const [clock,setClock]=useState(Date.now());
  const now=clock+offset;
  const [selected,setSelected]=useState(null);
  const [history,setHistory]=useState(null);
  const [historyPage,setHistoryPage]=useState(0);
  const [historyError,setHistoryError]=useState('');
  const closeHistory=useCallback(()=>{setSelected(null);setHistory(null);setHistoryError('');},[]);
  const dialogRef=useDialogFocus(Boolean(selected),closeHistory);
  useEffect(()=>{const timer=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{const timer=setTimeout(()=>{setQuery(search);setPage(0);},300);return()=>clearTimeout(timer);},[search]);
  useEffect(()=>{
    const tick=()=>setRefresh(n=>n+1);
    const timer=setInterval(tick,15000);window.addEventListener('focus',tick);
    return()=>{clearInterval(timer);window.removeEventListener('focus',tick);};
  },[]);
  useEffect(()=>{
    const controller=new AbortController();let cancelled=false;
    getCustomers({month,search:query,page,size:25},controller.signal).then(result=>{
      if(cancelled)return;
      if(page>0 && result.total>0 && page*25>=result.total){setPage(Math.floor((result.total-1)/25));return;}
      setData(result);setError('');setOffset(Date.parse(result.serverNow)-Date.now());
    }).catch(err=>{if(!cancelled)setError(err.message);});
    return()=>{cancelled=true;controller.abort();};
  },[month,query,page,refresh]);
  useEffect(()=>{
    const deadlines=(data?.items || []).flatMap(c=>c.pendingHolds || []).map(h=>Date.parse(h.expiresAt)).filter(Number.isFinite);
    if(!deadlines.length)return;
    const timer=setTimeout(()=>setRefresh(n=>n+1),Math.max(100,Math.min(...deadlines)-Date.now()-offset+100));
    return()=>clearTimeout(timer);
  },[data,offset]);
  useEffect(()=>{
    if(!selected)return;
    const controller=new AbortController();let cancelled=false;
    getCustomerHistory(selected,{month,page:historyPage,size:20},controller.signal).then(result=>{if(!cancelled){setHistory(result);setHistoryError('');}}).catch(err=>{if(!cancelled)setHistoryError(err.message);});
    return()=>{cancelled=true;controller.abort();};
  },[selected,historyPage,month,refresh]);
  const changeMonth=value=>{if(value && value<=currentMonth && value>='1900-01'){setMonth(value);setPage(0);}};
  const items=useMemo(()=>(data?.items || []).slice().sort((a,b)=>customerPriority(a,now)-customerPriority(b,now)),[data,now]);
  const stats=data?.month===month ? data.stats : null;
  const cards=[['Clientes totales',stats?.totalCustomers],['Nuevos en el mes',stats?.newCustomers],['Clientes que alquilaron',stats?.customersWithRentals],['Alquileres en el mes',stats?.rentals],['Con alquiler activo hoy',stats?.activeCustomers],['Con pago pendiente ahora',stats?.pendingCustomers]];
  const openHistory=id=>{setHistory(null);setHistoryPage(0);setHistoryError('');setSelected(id);};
  return <main className="pt-24 pb-10 px-4 sm:px-6 max-w-7xl mx-auto text-white space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-3"><div><h1 className="text-2xl font-bold">Clientes</h1><p className="text-white/60 mt-1">Cuentas, actividad e historial de alquileres.</p></div><button onClick={()=>setRefresh(n=>n+1)} className="min-h-11 px-4 rounded-lg border border-white/25">Actualizar</button></div>
    <section aria-label="Mes de las estadísticas" className="flex flex-wrap items-center gap-2 rounded-xl bg-white/5 border border-white/15 p-4">
      <button aria-label="Mes anterior" disabled={month==='1900-01'} onClick={()=>changeMonth(shiftMonth(month,-1))} className="min-h-11 min-w-11 border border-white/25 rounded-lg disabled:opacity-40">‹</button>
      <label className="text-sm">Mes<input type="month" min="1900-01" max={currentMonth} value={month} onChange={e=>changeMonth(e.target.value)} className="ml-2 min-h-11 rounded-lg bg-neutral-800 text-white border border-white/25 px-3"/></label>
      <button aria-label="Mes siguiente" disabled={month>=currentMonth} onClick={()=>changeMonth(shiftMonth(month,1))} className="min-h-11 min-w-11 border border-white/25 rounded-lg disabled:opacity-40">›</button>
      <button onClick={()=>changeMonth(currentMonth)} className="min-h-11 px-3 underline">Mes actual</button>
    </section>
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">{cards.map(([label,value])=><div key={label} className="min-w-0 p-4 rounded-xl border border-white/15 bg-white/5"><p className="text-xs text-white/60">{label}</p><strong className="text-2xl block mt-2">{value ?? '—'}</strong></div>)}</div>
    <p className="text-xs text-white/60">Las cifras mensuales cuentan alquileres con pago real confirmado que coinciden con las fechas del mes. Cada cliente se cuenta una vez. Los pagos de prueba se muestran en el historial y no se incluyen en esas cifras.</p>
    {stats?.unknownCreationDates>0 && <p className="text-xs text-amber-200">{stats.unknownCreationDates} cliente(s) anterior(es) no tienen fecha de creación registrada y no se cuentan como registros nuevos del mes.</p>}
    <label className="block text-sm">Buscar cliente<input value={search} maxLength={150} onChange={e=>setSearch(e.target.value)} placeholder="Nombre, correo, teléfono o DUI" className="block mt-1 w-full min-h-11 bg-neutral-800 rounded-lg border border-white/25 px-3"/></label>
    <p className="text-sm text-white/60">Primero quienes tienen un alquiler activo; después quienes esperan el pago. El listado conserva todos los clientes y muestra sus alquileres del mes seleccionado.</p>
    {error && <p role="alert" className="p-4 rounded-lg bg-red-500/15 text-red-200">{error}</p>}
    {!data && !error ? <p>Cargando clientes…</p> : items.length===0 ? <p className="py-6 text-white/60">No hay clientes para esta búsqueda.</p> : <ul className="space-y-3">{items.map(customer=>{
      const pending=pendingHolds(customer,now);
      return <li key={customer.id} className="p-4 rounded-xl border border-white/15 bg-white/5 space-y-3">
        <div className="flex flex-wrap justify-between items-start gap-3"><button onClick={()=>openHistory(customer.id)} className="text-left min-h-11 min-w-0 max-w-full"><strong className="block break-words">{customer.firstName} {customer.lastName}</strong><span className="text-sm text-white/60 break-all">{customer.email}</span></button>
          <div className="flex flex-wrap gap-2 text-xs">{customer.activeCount>0 && <span className="px-3 py-2 rounded-full bg-green-500/15 text-green-200">Alquiler activo ({customer.activeCount})</span>}{pending.length>0 && <span className="px-3 py-2 rounded-full bg-amber-500/15 text-amber-200">Pago pendiente ({pending.length})</span>}{!customer.activeCount && !pending.length && <span className="px-3 py-2 rounded-full bg-white/10 text-white/70">Sin reserva activa</span>}</div>
        </div>
        <div className="grid sm:grid-cols-3 gap-2 text-sm"><p><span className="text-white/50 block text-xs">Creación</span>{dateTime(customer.createdAt)}</p><p><span className="text-white/50 block text-xs">Último acceso</span>{dateTime(customer.lastLoginAt)}</p><p><span className="text-white/50 block text-xs">Alquileres en {month}</span>{data?.month===month ? customer.rentalsInMonth : '…'}</p></div>
        {pending.map(hold=><p key={hold.reservationId} className="text-sm text-amber-200">{hold.vehicleName} · Tiempo para pagar: <strong className="tabular-nums">{countdownText(hold.expiresAt,now)}</strong></p>)}
        <button onClick={()=>openHistory(customer.id)} className="min-h-11 underline text-sm">Ver historial y datos del cliente</button>
      </li>;
    })}</ul>}
    {data && <Pager page={data.page} size={data.size} total={data.total} onChange={setPage}/>}
    {selected && <div className="fixed inset-0 z-50 bg-black/70 p-3 sm:p-5 flex items-center justify-center"><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="customer-history-title" tabIndex={-1} className="bg-neutral-900 border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6 space-y-4">
      <div className="flex justify-between items-center gap-3"><h2 id="customer-history-title" className="text-xl font-bold">Historial del cliente</h2><button onClick={closeHistory} aria-label="Cerrar historial del cliente" className="min-h-11 min-w-11">✕</button></div>
      {historyError && <p role="alert" className="text-red-200">{historyError}</p>}
      {!history ? <p>Cargando historial…</p> : <>
        <div className="rounded-xl bg-white/5 p-4 text-sm space-y-1 break-words"><strong className="block text-lg">{history.customer.firstName} {history.customer.lastName}</strong><p className="break-all">{history.customer.email}</p><p>Teléfono: {history.customer.phoneNumber || 'No registrado'} · DUI: {history.customer.dui || 'No registrado'}</p><p>Creación: {dateTime(history.customer.createdAt)}</p><p>Último acceso: {dateTime(history.customer.lastLoginAt)}</p></div>
        <p className="text-sm text-white/60">Historial completo, sin limitarlo al mes seleccionado. Importes con IVA incluido.</p>
        {history.items.length===0 ? <p>Este cliente todavía no tiene reservas registradas.</p> : <ul className="space-y-3">{history.items.map(reservation=><li key={reservation.id} className="rounded-xl border border-white/15 p-4 space-y-1 text-sm"><strong>{reservation.vehicleName}</strong><p>{reservation.startDate} al {reservation.endDate}</p><p>{rentalLabel(reservation,rentalToday(new Date(now)))} · {money(reservation.totalPrice)} · IVA incluido</p>{reservation.paymentStatus==='PENDING' && <p className="text-amber-200">Tiempo para pagar: <strong className="tabular-nums">{countdownText(reservation.holdExpiresAt,now)}</strong></p>}</li>)}</ul>}
        <Pager page={history.page} size={history.size} total={history.total} onChange={setHistoryPage}/>
      </>}
    </div></div>}
  </main>;
}
