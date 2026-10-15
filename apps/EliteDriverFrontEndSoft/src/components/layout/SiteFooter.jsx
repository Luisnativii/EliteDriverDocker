import React from 'react';
import { Link } from 'react-router-dom';
import { business } from '../../config/businessInfo';

/**
 * Pie de página con los enlaces legales.
 * La ley de datos personales exige que el aviso de privacidad sea accesible
 * desde el sitio, así que el enlace va en el pie de la página principal.
 */
const SiteFooter = () => {
  const year = new Date().getFullYear();
  const razonSocial = business.razonSocial.startsWith('PENDIENTE')
    ? business.marca
    : business.razonSocial;

  return (
    <footer className="border-t border-white/10 px-4 py-10 pb-24 lg:pb-10">
      <div className="max-w-3xl mx-auto text-center space-y-5">
        {/* Enlaces principales: visibles sin llegar al fondo de la página */}
        <nav aria-label="Información del sitio" className="flex flex-wrap justify-center gap-2">
          <Link
            to="/customer/vehicles"
            className="text-sm text-white/80 hover:text-white bg-white/5 border border-white/10 rounded-lg px-4 min-h-11 inline-flex items-center transition"
          >
            Vehículos
          </Link>
          <Link
            to="/informacion"
            className="text-sm text-white/80 hover:text-white bg-white/5 border border-white/10 rounded-lg px-4 min-h-11 inline-flex items-center transition"
          >
            Sobre nosotros
          </Link>
          <Link
            to="/informacion/privacidad"
            className="text-sm text-white/80 hover:text-white bg-white/5 border border-white/10 rounded-lg px-4 min-h-11 inline-flex items-center transition"
          >
            Privacidad
          </Link>
        </nav>

        <nav aria-label="Enlaces legales" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link
            to="/informacion/privacidad"
            className="text-sm text-white/60 hover:text-white underline underline-offset-4 min-h-11 inline-flex items-center"
          >
            Aviso de privacidad
          </Link>
          <Link
            to="/informacion/terminos"
            className="text-sm text-white/60 hover:text-white underline underline-offset-4 min-h-11 inline-flex items-center"
          >
            Términos y Condiciones
          </Link>
          <Link
            to="/informacion/cookies"
            className="text-sm text-white/60 hover:text-white underline underline-offset-4 min-h-11 inline-flex items-center"
          >
            Cookies
          </Link>
          <Link
            to="/informacion/legal"
            className="text-sm text-white/60 hover:text-white underline underline-offset-4 min-h-11 inline-flex items-center"
          >
            Información legal
          </Link>
        </nav>

        <p className="text-xs text-white/35">
          © {year} {razonSocial}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;