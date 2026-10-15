import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ShieldCheck, FileText, Scale, Cookie, Info, Car, Phone, Mail,
} from 'lucide-react';
import { business, perfil } from '../config/businessInfo';

/**
 * Página pública de información: quiénes somos y dónde está lo legal.
 * Es la puerta de entrada a los cuatro documentos, sin pedir cuenta ni sesión.
 */
const InformacionPage = () => {
  const documentos = [
    {
      to: '/informacion/privacidad',
      icon: ShieldCheck,
      titulo: 'Aviso de privacidad',
      texto: 'Qué datos recogemos, para qué y cómo ejercer tus derechos.',
    },
    {
      to: '/informacion/terminos',
      icon: FileText,
      titulo: 'Términos y Condiciones',
      texto: 'Las reglas de la reserva, el pago, la entrega y las cancelaciones.',
    },
    {
      to: '/informacion/legal',
      icon: Scale,
      titulo: 'Información legal',
      texto: 'Datos del proveedor y registros obligatorios.',
    },
    {
      to: '/informacion/cookies',
      icon: Cookie,
      titulo: 'Política de cookies',
      texto: 'Qué cookies usamos. Solo las necesarias.',
    },
  ];

  return (
    <div className="min-h-dvh bg-neutral-900 text-white pb-16">
      {/* Encabezado */}
      <header className="sticky top-0 z-20 bg-neutral-900/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 min-h-11 px-2 -ml-2 rounded-lg text-white/70 hover:text-white active:scale-95 transition"
          >
            <ChevronLeft size={20} aria-hidden="true" />
            <span className="text-sm">Ir al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-10">
        {/* Quiénes somos */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Car className="text-red-500" aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl font-semibold">Sobre {business.marca}</h1>
          </div>
          <p className="text-white/75 leading-relaxed mb-6">{perfil.descripcion}</p>

          <h2 className="text-white font-semibold mb-2">Qué rentamos</h2>
          <ul className="space-y-1.5 text-white/75 list-disc pl-5 mb-6">
            {perfil.servicios.map(s => <li key={s}>{s}</li>)}
          </ul>

          <h2 className="text-white font-semibold mb-2">Qué necesitás</h2>
          <ul className="space-y-1.5 text-white/75 list-disc pl-5 mb-6">
            {perfil.requisitos.map(r => <li key={r}>{r}</li>)}
          </ul>

          <h2 className="text-white font-semibold mb-2">Dónde entregamos</h2>
          <ul className="space-y-1.5 text-white/75 list-disc pl-5">
            {perfil.zonas.map(z => <li key={z}>{z}</li>)}
          </ul>
        </section>

        {/* Documentos legales */}
        <section className="border-t border-white/10 pt-8">
          <div className="flex items-center gap-3 mb-1">
            <Info className="text-white/60" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Información legal</h2>
          </div>
          <p className="text-white/50 text-sm mb-5">
            Estos documentos son públicos. Podés leerlos sin crear una cuenta ni
            iniciar sesión.
          </p>

          <ul className="space-y-3">
            {documentos.map(({ to, icon: Icon, titulo, texto }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.99] transition"
                >
                  <span className="shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon size={18} className="text-red-400" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{titulo}</span>
                    <span className="block text-sm text-white/60 mt-0.5">{texto}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Contacto */}
        <section className="border-t border-white/10 pt-8">
          <h2 className="text-xl font-semibold mb-4">Contacto</h2>
          <ul className="space-y-3 text-white/80">
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-white/40 shrink-0" aria-hidden="true" />
              <span>{business.telefono}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-white/40 shrink-0" aria-hidden="true" />
              <span className="break-all">{business.email}</span>
            </li>
          </ul>
          <p className="text-white/50 text-sm mt-4">
            {business.razonSocial} · {business.domicilio}
          </p>
        </section>
      </main>
    </div>
  );
};

export default InformacionPage;