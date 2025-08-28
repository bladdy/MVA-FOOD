/* empty css                               */
import { c as createComponent, f as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_cUBcAsSp.mjs';
import { $ as $$Layout } from '../chunks/Layout_BTBz5APd.mjs';
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "MVA Foods - P\xE1gina no encontrada" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex items-center justify-center h-screen bg-gray-100"> <div class="text-center"> <img src="/mva-logo-rb.png" alt="MVA logo featuring a stylized hamburger, food truck, utensils, and large text MVA on an orange circle background, conveying a friendly and inviting food-related theme" class="mx-auto mb-4 h-48"> <h1 class="text-4xl font-bold text-orange-800">404</h1> <h1 class="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
Página no encontrada
</h1> <div class="mt-10 flex items-center justify-center gap-x-6"> <a href="/" class="rounded-md bg-orange-600 px-3.5 py-2.5 text-lg font-semibold text-white shadow-xs hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Volver al inicio</a> </div> </div> </div> ` })}`;
}, "C:/Proyectos/MVA-FOOD/client/src/pages/404.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/client/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
