import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import { business, derechosArcoPol } from '../../config/businessInfo';

/**
 * Aviso de privacidad.
 *
 * El artículo 7 de la Ley para la Protección de Datos Personales (Decreto
 * Legislativo N.° 144) obliga a informar, en forma expresa, precisa e
 * inequívoca, cinco cosas al recoger datos. Cada una tiene su apartado acá.
 */
const PrivacidadPage = () => (
  <LegalLayout
    title="Aviso de privacidad"
    intro="Este aviso explica qué datos personales recogemos, para qué los usamos y cómo puedes ejercer tus derechos sobre ellos. Es público y gratuito: no necesitás crear una cuenta ni iniciar sesión para leerlo."
    updated="Octubre de 2026"
  >
    <h2>1. Quién es el responsable</h2>
    <p>
      El responsable del tratamiento de tus datos personales es{' '}
      <strong>{business.razonSocial}</strong>, que opera comercialmente bajo la
      marca <strong>{business.marca}</strong>.
    </p>
    <p>
      Para cualquier asunto relacionado con tus datos podés escribirnos a{' '}
      <strong>{business.correoPrivacidad}</strong> o contactarnos en{' '}
      {business.telefono}, {business.domicilio}.
    </p>

    <h2>2. Para qué recogemos tus datos (a)</h2>
    <p>
      La finalidad es <strong>gestionar las reservas de alquiler de vehículos</strong>:
      registrar tu cuenta, mostrarte la disponibilidad, calcular y cobrar el
      precio de tu reserva y entregarte el vehículo en la fecha acordada.
    </p>
    <p>Destinatarios de tus datos:</p>
    <ul>
      <li>El equipo de {business.marca}, que administers las reservas.</li>
      <li>
        <strong>Wompi</strong>, plataforma de pago que procesa los pagos en nuestro
        nombre. Wompi recibe los datos estrictamente necesarios para cobrar.
      </li>
      <li>Autoridades competentes, cuando exista una obligación legal.</li>
    </ul>
    <p>
      No vendemos tus datos personales ni los usamos para publicidad de terceros.
    </p>

    <h2>3. Qué datos recogemos (a)</h2>
    <ul>
      <li>Nombre y apellido.</li>
      <li>Fecha de nacimiento (para verificar que seas mayor de 18 años).</li>
      <li>DUI y número de teléfono.</li>
      <li>Correo electrónico y contraseña, que guardamos cifradas.</li>
      <li>Datos de tus reservas: fechas, vehículo elegido y estado del pago.</li>
    </ul>

    <h2>4. Dónde se guardan y con qué respaldos (b)</h2>
    <p>
      Tus datos se almacenan en una base de datos dedicada (PostgreSQL) alojada
      en el servidor de {business.marca}. Esa base de datos es el repositorio
      principal; además mantenemos copias de respaldo periódicas para
      poder recuperar la información si occurriera una falla.
    </p>

    <h2>5. Cómo se protegen (e)</h2>
    <ul>
      <li>Las contraseñas se guardan cifradas con BCrypt: nadie puede leerlas.</li>
      <li>El acceso al panel de administración exige usuario y contraseña.</li>
      <li>El sitio se sirve cifrado por HTTPS.</li>
      <li>
        El acceso a los datos de una reserva está limitado a la persona titular y
        a los administradores autorizados.
      </li>
    </ul>

    <h2>6. Tus derechos ARCO-POL (d)</h2>
    <p>
      La ley reconoce cinco derechos sobre tus datos. Ejercelos escribiendo a{' '}
      <strong>{business.correoPrivacidad}</strong>:
    </p>
    <ul>
      {derechosArcoPol.map(d => (
        <li key={d.sigla}>
          <strong>{d.sigla} — {d.titulo}.</strong> {d.texto}
        </li>
      ))}
    </ul>
    <p>
      El acceso a tus datos es <strong>gratuito</strong>. Respondemos dentro de
      los plazos que fija la ley. Si no quedas conforme con la respuesta, podés
      acudir a la Agencia de Ciberseguridad del Estado.
    </p>

    <h2>7. Consentimiento y cambios de finalidad</h2>
    <p>
      Al registrarte nos das tu consentimiento de forma libre, específica,
      informada e individualizada para usar tus datos con la finalidad descrita.
      Podés revocarlo cuando quieras.
    </p>
    <p>
      Si en el futuro quisiéramos usar tus datos para un fin distinto al del
      alquiler de vehículos, te avisaríamos antes y pediríamos una nueva autorización.
    </p>

    <h2>8. Cambios en este aviso</h2>
    <p>
      Si cambiamos este aviso, publicaremos la versión actualizada en esta misma
      dirección y actualizaremos la fecha de arriba.
    </p>
  </LegalLayout>
);

export default PrivacidadPage;