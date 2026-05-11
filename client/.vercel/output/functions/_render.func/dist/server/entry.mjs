import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_Cd5HdoGt.mjs';
import { manifest } from './manifest_CZhsVpvs.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/admin/405.astro.mjs');
const _page3 = () => import('./pages/admin/configuracion.astro.mjs');
const _page4 = () => import('./pages/admin/dashboard.astro.mjs');
const _page5 = () => import('./pages/admin/menus/editor.astro.mjs');
const _page6 = () => import('./pages/admin/menus/platos.astro.mjs');
const _page7 = () => import('./pages/admin/menus/variantes.astro.mjs');
const _page8 = () => import('./pages/api/contact.astro.mjs');
const _page9 = () => import('./pages/api/upload.astro.mjs');
const _page10 = () => import('./pages/caracteristicas.astro.mjs');
const _page11 = () => import('./pages/contactos.astro.mjs');
const _page12 = () => import('./pages/cotizacion.astro.mjs');
const _page13 = () => import('./pages/cotizacion-limpieza.astro.mjs');
const _page14 = () => import('./pages/hospital.astro.mjs');
const _page15 = () => import('./pages/login.astro.mjs');
const _page16 = () => import('./pages/menus/nombre-de-restaurante.astro.mjs');
const _page17 = () => import('./pages/menus/pollos-los-hermanos.astro.mjs');
const _page18 = () => import('./pages/politica-privacidad.astro.mjs');
const _page19 = () => import('./pages/precios.astro.mjs');
const _page20 = () => import('./pages/qr.astro.mjs');
const _page21 = () => import('./pages/registrarse.astro.mjs');
const _page22 = () => import('./pages/renta.astro.mjs');
const _page23 = () => import('./pages/restaurantes/nombre-de-restaurante.astro.mjs');
const _page24 = () => import('./pages/restaurantes.astro.mjs');
const _page25 = () => import('./pages/terminos-servicio.astro.mjs');
const _page26 = () => import('./pages/volante.astro.mjs');
const _page27 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.9.2_@types+node@22._ad5bd7fd0db018969ac1f6ac1a2921a1/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/admin/405.astro", _page2],
    ["src/pages/admin/configuracion.astro", _page3],
    ["src/pages/admin/dashboard.astro", _page4],
    ["src/pages/admin/menus/editor.astro", _page5],
    ["src/pages/admin/menus/platos.astro", _page6],
    ["src/pages/admin/menus/variantes.astro", _page7],
    ["src/pages/api/contact.ts", _page8],
    ["src/pages/api/upload.ts", _page9],
    ["src/pages/caracteristicas.astro", _page10],
    ["src/pages/contactos.astro", _page11],
    ["src/pages/cotizacion.astro", _page12],
    ["src/pages/cotizacion-limpieza.astro", _page13],
    ["src/pages/hospital.astro", _page14],
    ["src/pages/login.astro", _page15],
    ["src/pages/menus/nombre-de-restaurante.astro", _page16],
    ["src/pages/menus/pollos-los-hermanos.astro", _page17],
    ["src/pages/politica-privacidad.astro", _page18],
    ["src/pages/precios.astro", _page19],
    ["src/pages/qr.astro", _page20],
    ["src/pages/registrarse.astro", _page21],
    ["src/pages/renta.astro", _page22],
    ["src/pages/restaurantes/nombre-de-restaurante.astro", _page23],
    ["src/pages/restaurantes/index.astro", _page24],
    ["src/pages/terminos-servicio.astro", _page25],
    ["src/pages/volante.astro", _page26],
    ["src/pages/index.astro", _page27]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "cfb9aba4-1d07-46b0-b317-53cf90ccd7c6",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
