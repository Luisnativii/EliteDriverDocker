import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import { business } from '../../config/businessInfo';

/**
 * Términos y Condiciones de uso y de alquiler.
 *
 * Se dejaron fuera los datos que dependen de un registro oficial (depósito,
 * índice de Aprovechamiento, etc.). Antes de publicar hay que definirlos con el
 * negocio: están marcados como PENDIENTE en el texto.
 */
const TerminosPage = () => (
  <LegalLayout
    title="Términos y Condiciones"
    intro="Estas condiciones regulan el uso de este sitio y el alquiler de vehículos. Al crear una cuenta y reservar, aceptás lo que está escrito aquí."
    updated="Octubre de 2026"
  >
    <h2>1. Quién somos</h2>
    <p>
      Este sitio es operado por <strong>{business.razonSocial}</strong>, que opera
      bajo la marca <strong>{business.marca}</strong>, con domicilio en{' '}
      {business.domicilio}, NIT {business.nit} y NRC {business.nrc}.
    </p>
    <p>
      Es un servicio de reserva de vehículos por días. No vendemos vehículos: los
      alquilamos por un período determinado, con un precio acordado.
    </p>

    <h2>2. Quién puede usar el sitio</h2>
    <p>Podés crear una cuenta si:</p>
    <ul>
      <li>Sos mayor de 18 años.</li>
      <li>Tenés licencia de conducir vigente.</li>
      <li>Contás con una tarjeta a tu nombre para el depósito y el cobro.</li>
    </ul>

    <h2>3. Cómo se hace una reserva</h2>
    <ol>
      <li>Elegís la fecha de retiro y de devolución.</li>
      <li>Revisás los vehículos disponibles para esas fechas.</li>
      <li>Seleccionás uno y el sistema calcula el precio: días × tarifa diaria, más IVA.</li>
      <li>Creás la cuenta y generás el enlace de pago.</li>
      <li>Completás el pago con Wompi.</li>
    </ol>
    <p>
      <strong>La reserva solo queda confirmada cuando el pago aparece como
      aprobado.</strong> Mientras tanto queda pendiente y el vehículo sigue
      disponible para otra persona.
    </p>

    <h2>4. Precio y pago</h2>
    <ul>
      <li>
        Los precios se muestran en dólares de El Salvador e <strong>incluyen el
        IVA</strong> ya aplicado.
      </li>
      <li>El precio se fija al crear la reserva y no cambia aunque luego varíe la tarifa.</li>
      <li>El pago se procesa en Wompi. {business.marca} no recibe el número de tu tarjeta.</li>
      <li>Cada enlace de pago admite un solo pago aprobado.</li>
    </ul>

    <h2>5. Depósito y garantía</h2>
    <p>
      PENDIENTE: definir el monto del depósito, la forma de pago, cuándo se
      devuelve y en qué condiciones se retiene. Es un punto que debe quedar
      escrito antes de cobrar.
    </p>

    <h2>6. Entrega y devolución</h2>
    <p>PENDIENTE: fijar el lugar y el horario de entrega y devolución, el combustible
      con el que se entrega el vehículo, el kilometraje permitido y el procedimiento
      en caso de accidente o panne.</p>

    <h2>7. Cancelaciones</h2>
    <p>PENDIENTE: plazo de cancelación sin costo, penalidad por cancelación tardía y
      qué pasa con el pago ya realizado.</p>

    <h2>8. Conducta del usuario</h2>
    <ul>
      <li>Usar el vehículo solo para lo pactado y con la licencia vigente del conductor.</li>
      <li>No subalquilar ni ceder el vehículo sin autorización escrita.</li>
      <li>No usar el vehículo para actividades ilícitas.</li>
      <li>No publicar contenido ofensivo o que vulnere derechos de terceros en este sitio.</li>
    </ul>

    <h2>9. Cancelación de reservas y cuentas</h2>
    <p>
      Podés cancelar una reserva desde <em>Mis reservas</em>. Si ya existe un pago
      registrado, la cancelación y los reembolsos los gestiona el negocio de forma
      manual: contáctanos y lo revisamos.
    </p>
    <p>
      Podemos cancelar una reserva o una cuenta si se detecta uso fraudulento de la
      plataforma, datos falsos o incumplimiento de estas condiciones.
    </p>

    <h2>10. Responsabilidad</h2>
    <p>
      {business.marca} pone un vehículo a su disposición según lo pactado. La
      responsabilidad por daños, averías o responsabilidades de tránsito durante el alquiler
      corresponde al conductor, conforme a la ley y al contrato de alquiler.
    </p>
    <p>
      El sitio se ofrece "como está". No podemos garantizar que esté disponible
      todo el tiempo ni que quede sin interrupciones.
    </p>

    <h2>11. Propiedad intelectual</h2>
    <p>
      El nombre comercial, el logotipo, las fotografías y el contenido de este
      sitio pertenecen a <strong>{business.razonSocial}</strong>. No se puede
      reproducir con fines comerciales sin autorización por escrito.
    </p>

    <h2>12. Ley aplicable</h2>
    <p>
      Estos términos se rigen por las leyes de la República de El Salvador.
      Cualquier controversia se somete a los tribunales competentes de San
      Salvador, sin perjuicio de que el consumidor pueda acudir a la Defensoría
      del Consumidor.
    </p>

    <h2>13. Cambios a estos términos</h2>
    <p>
      Podemos actualizar estos términos. La versión vigente será siempre la de
      esta página, con su fecha de actualización visible.
    </p>
  </LegalLayout>
);

export default TerminosPage;