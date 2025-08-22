/* empty css                                           */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B7UDdHjm.mjs';
import { $ as $$Layout } from '../chunks/Layout_BQZq4Hzi.mjs';
import { $ as $$ContactoSection } from '../chunks/ContactoSection_98AnS4kn.mjs';
export { renderers } from '../renderers.mjs';

const $$Contactos = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mva Foods - Contactos" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="lg:h-screen bg-gray-100"> ${renderComponent($$result2, "ContactoSection", $$ContactoSection, {})} </div> ` })}`;
}, "C:/Proyectos/MVA-FOOD/client/src/pages/contactos.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/client/src/pages/contactos.astro";
const $$url = "/contactos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Contactos,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
