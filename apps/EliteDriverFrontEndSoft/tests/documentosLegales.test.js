import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { business, camposPendientes, hayPendientes, derechosArcoPol } from '../src/config/businessInfo.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (rel) => readFileSync(join(raiz, rel), 'utf8');

const privacidad = leer('src/pages/legal/PrivacidadPage.jsx');
const terminos = leer('src/pages/legal/TerminosPage.jsx');
const cookies = leer('src/pages/legal/CookiesPage.jsx');
const legal = leer('src/pages/legal/LegalPage.jsx');
const app = leer('src/App.jsx');

/**
 * El artículo 7 de la Ley para la Protección de Datos Personales obliga a
 * informar cinco cosas al recoger datos. Si alguien quita un apartado, este
 * test lo delata antes de publicar.
 */
test('el aviso de privacidad cubre los cinco puntos que exige el Art. 7', () => {
    const exigidos = [
        ['a) finalidad y destinatarios', /Para qué recogemos tus datos/],
        ['b) existencia del banco de datos y respaldos', /Dónde se guardan/],
        ['c) datos de contacto del responsable', /Quién es el responsable/],
        ['d) derechos ARCO-POL y mecanismos', /Tus derechos ARCO-POL/],
        ['e) medidas de seguridad', /Cómo se protegen/],
    ];
    for (const [nombre, patron] of exigidos) {
        assert.match(privacidad, patron, `falta el literal ${nombre} en el aviso de privacidad`);
    }
});

test('el aviso de privacidad explica los cinco derechos ARCO-POL', () => {
    // Las siglas viven en businessInfo.js y la página las renderiza con .map(),
    // así que se comprueban las dos piezas: la lista y el render.
    const config = leer('src/config/businessInfo.js');
    for (const d of derechosArcoPol) {
        assert.match(config, new RegExp(`'${d.sigla}'`),
            `falta el derecho ${d.sigla} en la lista ARCO-POL`);
    }
    assert.match(privacidad, /derechosArcoPol\.map/, 'la página debe renderizar la lista');
    assert.match(privacidad, /Tus derechos ARCO-POL/);
    assert.match(privacidad, /gratuito/i, 'el acceso a los datos debe decirse gratuito');
});

test('los documentos legales son públicos y no piden sesión', () => {
    const rutas = ['/informacion', '/informacion/privacidad', '/informacion/terminos',
        '/informacion/cookies', '/informacion/legal'];
    for (const r of rutas) {
        assert.ok(app.includes(`path="${r}"`), `falta la ruta pública ${r}`);
    }
    // Ninguna puede estar dentro de ProtectedRoute.
    const idxAdmin = app.indexOf('requiredRole="admin"');
    const idxLegal = app.indexOf('/informacion/privacidad');
    assert.ok(idxLegal < idxAdmin, 'las rutas legales deben declararse antes de las protegidas');
});

test('el aviso legal menciona los dos registros obligatorios', () => {
    assert.match(legal, /21-A/, 'debe citar el Art. 21-A de la Ley de Protección al Consumidor');
    assert.match(legal, /Decreto Legislativo N\.° 144/, 'debe citar la ley de datos personales');
    assert.match(legal, /Agencia de Ciberseguridad del Estado/);
    assert.match(legal, /defensoria\.gob\.sv/i, 'debe decir dónde se hace el registro');
});

test('los términos aclaran que el precio incluye IVA', () => {
    assert.match(terminos, /IVA/);
    assert.match(terminos, /queda confirmada cuando el pago aparece como\s+aprobado/i,
        'debe quedar claro que sin pago aprobado no hay reserva confirmada');
});

test('las cookies declaran que no hay seguimiento de terceros', () => {
    assert.match(cookies, /No usamos cookies publicitarias/);
});

test('los textos no quedaron con caracteres ajenos al español', async () => {
    // Se_JPEGaron caracteres corruptos al redactar; esto los detecta.
    const { readdir } = await import('node:fs/promises');
    const falla = [];
    async function revisar(dir) {
        for (const e of await readdir(dir, { withFileTypes: true })) {
            const p = join(dir, e.name);
            if (e.isDirectory()) await revisar(p);
            else if (/\.jsx?$/.test(e.name)) {
                const t = readFileSync(p, 'utf8');
                if (/[一-鿿]/.test(t)) falla.push(p);
            }
        }
    }
    await revisar(join(raiz, 'src'));
    assert.deepEqual(falla, [], 'hay caracteres chinos/corruptos en el código');
});

test('los datos legales pendientes quedan listados para no olvidarlos', () => {
    assert.equal(typeof hayPendientes, 'boolean');
    if (hayPendientes) {
        // Mientras haya PENDIENTE, deben existir los campos claves del negocio.
        for (const clave of ['razonSocial', 'nit', 'nrc', 'domicilio', 'telefono',
            'registroComercioElectronico', 'registroACE']) {
            assert.ok(camposPendientes.includes(clave),
                `${clave} debería seguir pendiente: no se puede publicar sin él`);
        }
    }
    assert.ok(business.marca.length > 0);
});