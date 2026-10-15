import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { business } from '../../config/businessInfo';

/**
 * Envoltura común de los documentos legales.
 * Mantiene el mismo encabezado, el botón de volver y el pie en los cuatro
 * documentos, para que leer cualquiera se sienta parte del mismo sitio.
 */
const LegalLayout = ({ title, intro, updated, children }) => (
  <div className="min-h-dvh bg-neutral-900 text-white">
    {/* Encabezado */}
    <header className="sticky top-0 z-20 bg-neutral-900/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link
          to="/informacion"
          className="inline-flex items-center gap-1 min-h-11 px-2 -ml-2 rounded-lg text-white/70 hover:text-white active:scale-95 transition"
        >
          <ChevronLeft size={20} aria-hidden="true" />
          <span className="text-sm">Información</span>
        </Link>
        <span className="text-xs text-white/40 truncate">{business.marca}</span>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-4 pt-8 pb-24">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-3">{title}</h1>
      {intro && <p className="text-white/70 text-sm sm:text-base mb-2 leading-relaxed">{intro}</p>}
      {updated && (
        <p className="text-xs text-white/40 mb-8">
          Última actualización: {updated}
        </p>
      )}
      <div className="space-y-6 text-sm sm:text-[15px] leading-relaxed text-white/80 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:pl-1 [&_p]:mb-3 [&_strong]:text-white">
        {children}
      </div>
    </main>

    {/* Pie */}
    <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/40">
      <p>
        © {new Date().getFullYear()} {business.razonSocial.startsWith('PENDIENTE')
          ? business.marca
          : business.razonSocial}
        . Todos los derechos reservados.
      </p>
    </footer>
  </div>
);

export default LegalLayout;