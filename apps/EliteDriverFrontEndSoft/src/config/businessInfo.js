// config/businessInfo.js
// Fuente única de verdad para los datos legales del negocio.
// Los avisos legales del sitio se construyen desde aquí: si cambia un dato,
// cambia en todas partes y no queda desactualizado en un pie de página.
//
// TODO lo marcado como PENDIENTE lo debe completar el negocio antes de publicar.
// Búsqualos con:  grep -rn "PENDIENTE:" src/

export const PENDIENTE = 'PENDIENTE: completar antes de publicar';

export const business = {
  // Nombre comercial con el que opera la marca.
  marca: 'Elite Driver',
  // Razón social exacta tal como figura en el registro de la empresa.
  razonSocial: PENDIENTE,
  nrc: PENDIENTE,
  nit: PENDIENTE,

  domicilio: PENDIENTE,
  telefono: PENDIENTE,
  email: PENDIENTE,

  sitioWeb: 'https://elitedriver.luisnativii.site',

  // Persona o unidad que responde por el tratamiento de datos personales.
  responsableTratamiento: PENDIENTE,
  correoPrivacidad: PENDIENTE,

  // Registros obligatorios que deben estar inscritos antes de operar.
  registroComercioElectronico: PENDIENTE, // Registro Unico de Proveedores (Art. 21-A LPC)
  registroACE: PENDIENTE,                  // Banco de datos personales (Ley Proteccion Datos Personales)

  // Datos de facturacion
  dte: PENDIENTE,
};

// Lista de campos pendientes, para poder listarlos y no olvidarlos.
export const camposPendientes = Object.entries(business)
  .filter(([, v]) => typeof v === 'string' && v.startsWith('PENDIENTE'))
  .map(([k]) => k);

export const hayPendientes = camposPendientes.length > 0;

/**
 * Datos que el negocio publica de sí mismo y que no dependen de un registro oficial.
 * Se usan en la página "Sobre nosotros" y se pueden completar sin abogado.
 */
export const perfil = {
  descripcion:
    'Alquiler de vehículos en El Salvador. Elegís la fecha, mirás los autos ' +
    'disponibles y reservás en línea con pago seguro.',

  servicios: [
    'Sedanes para ciudad y viajes cortos',
    'SUV para caminos de tierra y familias',
    'Pickups para carga y trabajo',
  ],

  requisitos: [
    'Ser mayor de 18 años',
    'Licencia de conducir vigente',
    'Tarjeta de crédito o débito a nombre del titular de la reserva',
  ],

  zonas: ['San Salvador y área metropolitana', 'La Libertad', 'Sonsonate', 'La Paz'],
};

/**
 * Mecanismos para ejercer los derechos ARCO-POL (Acceso, Rectificación,
 * Cancelación, Oposición y Privacidad) exigidos por la Ley para la Protección
 * de Datos Personales.
 */
export const derechosArcoPol = [
  {
    sigla: 'Acceso',
    titulo: 'Saber qué datos tenemos',
    texto: 'Pedir copia gratuita de los datos personales que tenemos sobre tu persona.',
  },
  {
    sigla: 'Rectificación',
    titulo: 'Corregir datos equivocados',
    texto: 'Actualizar tu nombre, teléfono, correo u otro dato que esté incorrecto.',
  },
  {
    sigla: 'Cancelación',
    titulo: 'Solicitar la eliminación',
    texto: 'Pedir que eliminemos tus datos cuando ya no exista una obligación legal de conservarlos.',
  },
  {
    sigla: 'Oposición',
    titulo: 'Oponerte al uso',
    texto: 'Negarte a que usemos tus datos para una finalidad concreta.',
  },
  {
    sigla: 'Privacidad',
    titulo: 'Decidir sobre tu información',
    texto: 'Revocar el consentimiento que diste y conocer qué hacemos con tus datos.',
  },
];

export default business;