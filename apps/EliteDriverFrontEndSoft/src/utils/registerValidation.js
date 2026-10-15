// utils/registerValidation.js
// Validación pura del registro: sin React, para poder probarla con `node --test`.
// Las reglas deben coincidir con RegisterRequest.java y AuthService.register del backend.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_HINT = 'Mínimo 10 caracteres, con al menos una letra y un número.';

/**
 * El backend responde los errores de validación en `{ fields: { campo: mensaje } }`.
 * Las reglas de negocio (contraseña débil, email/DUI repetido, edad) llegan en cambio
 * como un mensaje suelto en `error`, así que se asocian al campo que le corresponde
 * para que el usuario vea el motivo junto a su input y no solo un aviso genérico.
 */
const BUSINESS_RULES = [
    [/contraseñas no coinciden/i, 'confirmPassword'],
    [/contraseña/i, 'password'],
    [/email/i, 'email'],
    [/\bdui\b/i, 'dui'],
    [/18 años|fecha de nacimiento/i, 'birthDate'],
    [/teléfono/i, 'phoneNumber'],
];

const GENERIC = 'No se pudieron validar los datos. Revisa el formulario e inténtalo de nuevo.';

/**
 * Convierte la respuesta de error del backend en errores por campo.
 * @param {Object} payload - Cuerpo de la respuesta (puede ser undefined).
 * @returns {Object} Errores por campo; `submit` solo si el fallo no corresponde a un campo.
 */
export const fieldErrorsFromResponse = (payload) => {
    const errors = {};
    const fields = payload?.fields;

    if (fields && typeof fields === 'object') {
        for (const [name, message] of Object.entries(fields)) {
            if (message) errors[name] = message;
        }
    }

    const general = payload?.error;
    if (general && typeof general === 'string' && general !== 'Error de validación') {
        const rule = BUSINESS_RULES.find(([pattern]) => pattern.test(general));
        if (rule) {
            if (!errors[rule[1]]) errors[rule[1]] = general;
        } else {
            errors.submit = general;
        }
    }

    if (Object.keys(errors).length === 0) errors.submit = GENERIC;
    return errors;
};

const checkName = (value, label) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return `${label} es requerido`;
    if (trimmed.length < 2) return `El ${label.toLowerCase()} debe tener al menos 2 caracteres`;
    if (trimmed.length > 50) return `El ${label.toLowerCase()} no puede superar 50 caracteres`;
    return null;
};

/**
 * Valida el formulario de registro con las mismas reglas del servidor.
 * @param {Object} data - Datos del formulario.
 * @returns {Object} Errores por campo; objeto vacío si todo es válido.
 */
export const validateRegistration = (data) => {
    const errors = {};

    errors.firstName = checkName(data.firstName, 'Nombre');
    errors.lastName = checkName(data.lastName, 'Apellido');

    // El backend espera yyyy-MM-dd y exige 18 años.
    if (!data.birthDate) {
        errors.birthDate = 'La fecha de nacimiento es requerida';
    } else {
        const birth = new Date(data.birthDate);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const monthDiff = now.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
        if (Number.isNaN(birth.getTime())) {
            errors.birthDate = 'La fecha de nacimiento no es válida';
        } else if (age < 18) {
            errors.birthDate = 'Debes ser mayor de 18 años';
        } else if (age > 100) {
            errors.birthDate = 'Verifica la fecha de nacimiento';
        }
    }

    // 9 dígitos; el guion se agrega al enviar.
    if (!data.dui) {
        errors.dui = 'El DUI es requerido';
    } else if (data.dui.length !== 9) {
        errors.dui = 'El DUI debe tener 9 dígitos';
    }

    if (!data.phoneNumber) {
        errors.phoneNumber = 'El número de teléfono es requerido';
    } else if (data.phoneNumber.length !== 8) {
        errors.phoneNumber = 'El número de teléfono debe tener 8 dígitos';
    } else if (!/^[67]/.test(data.phoneNumber)) {
        errors.phoneNumber = 'El número de teléfono debe iniciar con 6 o 7';
    }

    if (!data.email) {
        errors.email = 'El correo electrónico es requerido';
    } else if (!EMAIL_RE.test(data.email.trim())) {
        errors.email = 'El correo electrónico no es válido';
    }

    // Mismo criterio que AuthService.register: 10+ caracteres, una letra y un número.
    const password = data.password || '';
    if (!password) {
        errors.password = 'La contraseña es requerida';
    } else if (password.length < 10) {
        errors.password = 'La contraseña debe tener al menos 10 caracteres';
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        errors.password = 'La contraseña debe incluir al menos una letra y un número';
    }

    if (!data.confirmPassword) {
        errors.confirmPassword = 'La confirmación de contraseña es requerida';
    } else if (password !== data.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    for (const key of Object.keys(errors)) {
        if (!errors[key]) delete errors[key];
    }
    return errors;
};

/**
 * Ajusta DUI y teléfono al formato que exige el backend (00000000-0 / 0000-0000).
 * @param {Object} data - Datos del formulario.
 * @returns {Object} Datos listos para la API.
 */
export const formatRegistrationForAPI = (data) => ({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    birthDate: data.birthDate,
    dui: data.dui.length === 9 ? `${data.dui.slice(0, 8)}-${data.dui.slice(8)}` : data.dui,
    phoneNumber: data.phoneNumber.length === 8
        ? `${data.phoneNumber.slice(0, 4)}-${data.phoneNumber.slice(4)}`
        : data.phoneNumber,
    email: data.email.trim().toLowerCase(),
    password: data.password,
    confirmPassword: data.confirmPassword,
});