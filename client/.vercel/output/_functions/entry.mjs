import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_B0Dud23L.mjs';
import { manifest } from './manifest_D8f-yvuw.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/api/contact.astro.mjs');
const _page3 = () => import('./pages/caracteristicas.astro.mjs');
const _page4 = () => import('./pages/contactos.astro.mjs');
const _page5 = () => import('./pages/menus/_id_.astro.mjs');
const _page6 = () => import('./pages/politica-privacidad.astro.mjs');
const _page7 = () => import('./pages/precios.astro.mjs');
const _page8 = () => import('./pages/qr.astro.mjs');
const _page9 = () => import('./pages/registrarse.astro.mjs');
const _page10 = () => import('./pages/restaurantes/_id_.astro.mjs');
const _page11 = () => import('./pages/restaurantes.astro.mjs');
const _page12 = () => import('./pages/terminos-servicio.astro.mjs');
const _page13 = () => import('./pages/volante.astro.mjs');
const _page14 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.9.2_@types+node@22._ad5bd7fd0db018969ac1f6ac1a2921a1/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/api/contact.ts", _page2],
    ["src/pages/caracteristicas.astro", _page3],
    ["src/pages/contactos.astro", _page4],
    ["src/pages/menus/[id].astro", _page5],
    ["src/pages/politica-privacidad.astro", _page6],
    ["src/pages/precios.astro", _page7],
    ["src/pages/qr.astro", _page8],
    ["src/pages/registrarse.astro", _page9],
    ["src/pages/restaurantes/[id].astro", _page10],
    ["src/pages/restaurantes/index.astro", _page11],
    ["src/pages/terminos-servicio.astro", _page12],
    ["src/pages/volante.astro", _page13],
    ["src/pages/index.astro", _page14]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "22b178c3-fc50-44dd-b6f5-5f2e73158f16",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
