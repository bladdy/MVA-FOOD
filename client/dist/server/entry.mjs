import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_5hlSgpin.mjs';
import { manifest } from './manifest_B8iqWAMq.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/api/contact.astro.mjs');
const _page3 = () => import('./pages/api/upload.astro.mjs');
const _page4 = () => import('./pages/caracteristicas.astro.mjs');
const _page5 = () => import('./pages/contactos.astro.mjs');
const _page6 = () => import('./pages/menus/_id_.astro.mjs');
const _page7 = () => import('./pages/politica-privacidad.astro.mjs');
const _page8 = () => import('./pages/precios.astro.mjs');
const _page9 = () => import('./pages/qr.astro.mjs');
const _page10 = () => import('./pages/registrarse.astro.mjs');
const _page11 = () => import('./pages/restaurantes/_id_.astro.mjs');
const _page12 = () => import('./pages/restaurantes.astro.mjs');
const _page13 = () => import('./pages/terminos-servicio.astro.mjs');
const _page14 = () => import('./pages/volante.astro.mjs');
const _page15 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.9.2_@types+node@22._ad5bd7fd0db018969ac1f6ac1a2921a1/node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/api/contact.ts", _page2],
    ["src/pages/api/upload.ts", _page3],
    ["src/pages/caracteristicas.astro", _page4],
    ["src/pages/contactos.astro", _page5],
    ["src/pages/menus/[id].astro", _page6],
    ["src/pages/politica-privacidad.astro", _page7],
    ["src/pages/precios.astro", _page8],
    ["src/pages/qr.astro", _page9],
    ["src/pages/registrarse.astro", _page10],
    ["src/pages/restaurantes/[id].astro", _page11],
    ["src/pages/restaurantes/index.astro", _page12],
    ["src/pages/terminos-servicio.astro", _page13],
    ["src/pages/volante.astro", _page14],
    ["src/pages/index.astro", _page15]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///C:/Proyectos/MVA-FOOD/client/dist/client/",
    "server": "file:///C:/Proyectos/MVA-FOOD/client/dist/server/",
    "host": true,
    "port": 4444,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
