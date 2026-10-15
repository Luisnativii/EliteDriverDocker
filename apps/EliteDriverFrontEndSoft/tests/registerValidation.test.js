import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    validateRegistration,
    formatRegistrationForAPI,
    fieldErrorsFromResponse,
} from '../src/utils/registerValidation.js';

const valid = {
    firstName: 'Luis',
    lastName: 'Nativi',
    birthDate: '2003-07-02',
    dui: '065311929',
    phoneNumber: '72053098',
    email: 'luis.nativi24@gmail.com',
    password: 'Contrasena1',
    confirmPassword: 'Contrasena1',
};

test('un formulario completo no produce errores', () => {
    assert.deepEqual(validateRegistration(valid), {});
});

test('la contraseña exige 10 caracteres, una letra y un número (igual que el backend)', () => {
    // El frontend pedía 6: una contraseña de 6-9 pasaba el cliente y el servidor la rechazaba.
    assert.equal(validateRegistration({ ...valid, password: 'Ab1', confirmPassword: 'Ab1' }).password,
        'La contraseña debe tener al menos 10 caracteres');
    assert.equal(validateRegistration({ ...valid, password: '1234567890', confirmPassword: '1234567890' }).password,
        'La contraseña debe incluir al menos una letra y un número');
    assert.equal(validateRegistration({ ...valid, password: 'abcdefghijk', confirmPassword: 'abcdefghijk' }).password,
        'La contraseña debe incluir al menos una letra y un número');
    assert.equal(validateRegistration(valid).password, undefined);
});

test('las contraseñas que no coinciden se reportan en confirmar contraseña', () => {
    assert.equal(validateRegistration({ ...valid, confirmPassword: 'OtraClave1' }).confirmPassword,
        'Las contraseñas no coinciden');
});

test('el mensaje del backend se muestra bajo el campo que falló', () => {
    // Regresión: el hook descartaba `fields` y solo mostraba un aviso genérico.
    const payload = {
        error: 'Error de validación',
        status: 400,
        fields: { password: 'La contraseña debe tener entre 10 y 100 caracteres' },
    };
    const errors = fieldErrorsFromResponse(payload);
    assert.equal(errors.password, 'La contraseña debe tener entre 10 y 100 caracteres');
    assert.equal(errors.submit, undefined, 'no debe mostrarse un error general si el fallo es de un campo');
});

test('varios campos con error se conservan a la vez', () => {
    const errors = fieldErrorsFromResponse({
        error: 'Error de validación',
        fields: { dui: 'DUI debe tener formato 00000000-0', phoneNumber: 'Teléfono debe tener formato 0000-0000' },
    });
    assert.deepEqual(Object.keys(errors).sort(), ['dui', 'phoneNumber']);
});

test('las reglas de negocio del backend se asignan al campo correcto', () => {
    assert.equal(fieldErrorsFromResponse({ error: 'El email ya está registrado' }).email,
        'El email ya está registrado');
    assert.equal(fieldErrorsFromResponse({ error: 'El DUI ya está registrado' }).dui,
        'El DUI ya está registrado');
    assert.equal(fieldErrorsFromResponse({ error: 'Las contraseñas no coinciden' }).confirmPassword,
        'Las contraseñas no coinciden');
    assert.equal(
        fieldErrorsFromResponse({ error: 'La contraseña debe tener al menos 10 caracteres, una letra y un número' }).password,
        'La contraseña debe tener al menos 10 caracteres, una letra y un número');
    assert.equal(fieldErrorsFromResponse({ error: 'Debes tener al menos 18 años para registrarte' }).birthDate,
        'Debes tener al menos 18 años para registrarte');
});

test('un error que no corresponde a un campo se muestra como general', () => {
    assert.equal(fieldErrorsFromResponse({ error: 'Error interno del servidor.' }).submit,
        'Error interno del servidor.');
});

test('una respuesta vacía nunca deja el formulario sin explicación', () => {
    assert.ok(fieldErrorsFromResponse(undefined).submit);
    assert.ok(fieldErrorsFromResponse({}).submit);
});

test('DUI y teléfono se envían con el guion que exige RegisterRequest', () => {
    const sent = formatRegistrationForAPI(valid);
    assert.equal(sent.dui, '06531192-9');
    assert.equal(sent.phoneNumber, '7205-3098');
    assert.equal(sent.email, 'luis.nativi24@gmail.com');
    assert.match(sent.dui, /^\d{8}-\d$/);
    assert.match(sent.phoneNumber, /^\d{4}-\d{4}$/);
});

test('el correo se normaliza a minúsculas', () => {
    assert.equal(formatRegistrationForAPI({ ...valid, email: '  Luis.Nativi24@Gmail.COM ' }).email,
        'luis.nativi24@gmail.com');
});

test('DUI incompleto y teléfono inválido se detectan antes de enviar', () => {
    assert.ok(validateRegistration({ ...valid, dui: '12345' }).dui);
    assert.ok(validateRegistration({ ...valid, phoneNumber: '12345678' }).phoneNumber,
        'un teléfono que no inicia con 6 o 7 es inválido en El Salvador');
    assert.ok(validateRegistration({ ...valid, email: 'no-es-correo' }).email);
});