import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';
import { business, camposPendientes } from '../../config/businessInfo';

/**
 * Información legal del proveedor.
 *
 * Concentra los datos registrales y los avisos que la ley exige mostrar
 * públicamente. Los campos que dependen de inscripciones oficiales aparecen
 * marcados como pendientes hasta que el negocio los inscriba.
 */
const LegalPage = () => (
  <LegalLayout
    title="Información legal"
    intro="Datos del proveedor, registros obligatorios y avisos que corresponden a este servicio."
    updated="Octubre de 2026"
  >
    <h2>Proveedor del servicio</h2>
    <ul>
      <li><strong>Marca comercial:</strong> {business.marca}</li>
      <li><strong>Razón social:</strong> {business.razonSocial}</li>
      <li><strong>NIT:</strong> {business.nit}</li>
      <li><strong>NRC:</strong> {business.nrc}</li>
      <li><strong>Domicilio:</strong> {business.domicilio}</li>
      <li><strong>Teléfono:</strong> {business.telefono}</li>
      <li><strong>Correo:</strong> {business.email}</li>
      <li><strong>Sitio web:</strong> {business.sitioWeb}</li>
    </ul>

    <h2>Registros obligatorios</h2>
    <p>
      Como proveedor de bienes y servicios por comercio electrónico, este
      servicio debe estar inscrito en el <strong>Registro Único de Proveedores de
      Bienes y Servicios en Comercio Electrónico</strong> de la Defensoría del
      Consumidor, conforme al artículo 21-A de la Ley de Protección al
      Consumidor. El trámite es gratuito y se realiza en línea en{' '}
      <strong>www.defensoria.gob.sv</strong>.
    </p>
    <p>
      <strong>Estado del registro:</strong> {business.registroComercioElectronico}
    </p>
    <p>
      El tratamiento de datos personales se rige por la Ley para la Protección de
      Datos Personales (Decreto Legislativo N.° 144), cuya autoridad competente
      es la Agencia de Ciberseguridad del Estado.
    </p>
    <p>
      <strong>Estado del registro ante la ACE:</strong> {business.registroACE}
    </p>

    <h2>Forma de pago</h2>
    <p>
      Los pagos se procesan a través de <strong>Wompi</strong>, plataforma
      reconocida de pago en El Salvador. {business.marca} no almacena el número de
      tu tarjeta: viaja cifrado entre tu dispositivo y Wompi.
    </p>

    <h2>Moneda</h2>
    <p>
      Todos los precios se expresan en <strong>dólares de El Salvador (USD)</strong>
      e incluyen el IVA correspondiente en la tarifa diaria y en el total de la
      reserva. No se suma IVA adicional al precio publicado.
    </p>

    <h2>Documentos relacionados</h2>
    <ul>
      <li><strong>Aviso de privacidad</strong></li>
      <li><strong>Términos y Condiciones</strong></li>
      <li><strong>Política de cookies</strong></li>
    </ul>

    {camposPendientes.length > 0 && (
      <>
        <h2>Datos pendientes de completar</h2>
        <p>
          Estos apartados se publican con marcadores porque dependen de datos que
          el negocio debe registrar antes de operar:{' '}
          <span className="text-amber-300">
            {camposPendientes.join(', ')}
          </span>
          .
        </p>
      </>
    )}
  </LegalLayout>
);

export default LegalPage;