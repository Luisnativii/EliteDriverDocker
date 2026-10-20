import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/apiConfig';

/**
 * Muestra en una esquina del panel de administración qué versión está desplegada.
 *
 * Compara la versión compilada en el frontend con la que responde el backend.
 * Si difieren (o el backend todavía no expone el endpoint), significa que una
 * de las dos imágenes quedó desactualizada en el servidor.
 *
 * Solo se renderiza para administradores.
 */
const VersionBadge = () => {
  const { user } = useAuth();
  const build = import.meta.env.VITE_APP_VERSION || 'desconocida';
  const [backend, setBackend] = useState('...');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    const controller = new AbortController();
    const check = () => fetch(`${API_BASE_URL}/version`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => { if (!cancelled) setBackend(data?.version || 'desconocida'); })
      .catch(() => { if (!cancelled) setBackend('sin /api/version'); });

    check();
    const interval = setInterval(check, 60000);
    window.addEventListener('focus', check);
    return () => { cancelled = true; controller.abort(); clearInterval(interval); window.removeEventListener('focus', check); };
  }, []);

  if (user?.routeRole !== 'admin') return null;

  // El backend anterior a esta versión no tenía el endpoint.
  const stale = backend.startsWith('sin /api') || (backend !== '...' && backend !== build);

  return (
    // Abajo a la derecha: la esquina inferior izquierda la ocupa el bloque de
    // usuario y "Cerrar sesión" del sidebar.
    <div className="fixed bottom-3 right-3 z-50 font-mono text-[11px] select-none">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Versión desplegada"
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md border backdrop-blur-sm transition-colors ${
          stale
            ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
            : 'bg-white/5 border-white/20 text-white/60 hover:text-white/90'
        }`}
      >
        <span
          aria-hidden="true"
          className={`w-1.5 h-1.5 rounded-full ${stale ? 'bg-amber-400' : 'bg-emerald-400'}`}
        />
        {build}
      </button>

      {open && (
        // Se abre hacia arriba para no salirse de la pantalla.
        <div className="absolute bottom-full right-0 mb-1 p-2 rounded-md bg-neutral-900/95 border border-white/15 text-white/80 space-y-0.5 shadow-lg">
          <div>frontend: {build}</div>
          <div>backend:&nbsp; {backend}</div>
          {stale && <div className="text-amber-300 pt-1 max-w-64 whitespace-normal">
            <p>Hay una nueva versión o las versiones no coinciden.</p>
            <button type="button" onClick={() => window.location.reload()} className="min-h-11 underline font-semibold">Recargar panel</button>
            <p>Si el aviso continúa después de recargar, revisa el despliegue.</p>
          </div>}
        </div>
      )}
    </div>
  );
};

export default VersionBadge;