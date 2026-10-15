import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import { business } from '../../config/businessInfo';

/**
 * Política de cookies.
 *
 * El sitio usa lo mínimo: una sesión y una preferencia de versión. No hay
 * cookies publicitarias ni de seguimiento de terceros.
 */
const CookiesPage = () => (
  <LegalLayout
    title="Política de cookies"
    intro="Las cookies son archivos que el navegador guarda en tu dispositivo. Acá explicamos cuáles usamos, para qué y cómo evitar las que no sean necesarias."
    updated="Octubre de 2026"
  >
    <h2>Qué son las cookies</h2>
    <p>
      Son pequeños archivos de texto que el sitio guarda en tu teléfono o
      computadora. Le permiten recordar información entre visitas para no tener
      que escribir lo mismo cada vez.
    </p>

    <h2>Qué cookies usa este sitio</h2>
    <ul>
      <li>
        <strong>Sesión (necesaria).</strong> Guarda tu token de acceso para que
        no tengas que iniciar sesión en cada página. Es la única estrictamente
        necesaria y sin ella el sitio no funciona.
      </li>
      <li>
        <strong>Preferencias (necesaria).</strong> Recuerda datos de navegación
        para mostrarte mejor el contenido.
      </li>
    </ul>
    <p>
      <strong>No usamos cookies publicitarias, de perfilado ni de seguimiento de
      terceros.</strong> Tampoco usamos cookies de redes sociales para medir tu
      navegación.
    </p>

    <h2>Quién guarda la información</h2>
    <p>
      Las cookies se guardan en tu propio dispositivo. {business.marca} no
      almacena esa información en un servidor externo con fines de perfilado.
    </p>

    <h2>Cómo deshabilitarlas</h2>
    <p>
      Podés borrar o bloquear las cookies desde la configuración de tu
      navegador. Tené en cuenta que si bloqueás las cookies necesarias, el inicio
      de sesión puede dejar de funcionar.
    </p>
    <p>
      Cada navegador tiene su propia forma de hacerlo, normalmente en la sección
      de privacidad o seguridad.
    </p>

    <h2>Consentimiento</h2>
    <p>
      Como este sitio solo usa cookies necesarias para funcionar, no necesitamos
      pedirte un consentimiento previo para ellas. Si en el futuro agregamos
      cookies que sí lo requieran, te lo vamos a avisar y pediremos tu
      autorización antes de activarlas.
    </p>

    <h2>Si tenés dudas</h2>
    <p>
      Sobre privacidad o cookies podés escribirnos a{' '}
      <strong>{business.correoPrivacidad}</strong>.
    </p>
  </LegalLayout>
);

export default CookiesPage;