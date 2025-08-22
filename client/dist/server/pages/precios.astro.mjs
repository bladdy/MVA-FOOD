/* empty css                                           */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B7UDdHjm.mjs';
import { $ as $$Layout } from '../chunks/Layout_BQZq4Hzi.mjs';
export { renderers } from '../renderers.mjs';

const $$Precios = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mva Foods - Precios" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex items-center justify-center h-screen bg-gray-100 p-8"> <div class="text-center"> <img src="/img/work.png" alt="MVA logo featuring a stylized hamburger, food truck, utensils, and large text MVA on an orange circle background, conveying a friendly and inviting food-related theme" class="mx-auto mb-4 h-48"> <h1 class="mt-4 text-5xl font-semibold tracking-tight text-orange-800 sm:text-7xl">
Estamos trabajando
</h1> <!-- Mensaje de aviso --> <div class="mt-8 text-lg text-gray-700"> <p>Aún no tenemos listos los registros ni los pagos.</p> <p>Por favor, comunícate con nosotros a través de los contratos y/o deja tus datos en nuestro formulario de contactos.</p> <p>Nos pondremos en contacto contigo para más detalles.</p> </div> <div class="mt-10 flex items-center justify-center gap-x-6"> <a href="/contactos" class="rounded-md bg-orange-600 px-3.5 py-2.5 text-lg font-semibold text-white shadow-xs hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
Ir a Contacto
</a> </div> </div> </div> ` })}`;
}, "C:/Proyectos/MVA-FOOD/client/src/pages/precios.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/client/src/pages/precios.astro";
const $$url = "/precios";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Precios,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
