/* empty css                                           */
import { c as createComponent, f as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_cUBcAsSp.mjs';
import { $ as $$Layout } from '../chunks/Layout_BfXVipIs.mjs';
import { $ as $$CharacteristicsSection } from '../chunks/CharacteristicsSection_DygUAUj4.mjs';
export { renderers } from '../renderers.mjs';

const $$Caracteristicas = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mva Foods - Caracter\xEDsticas" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="lg:h-screen bg-gradient-to-r from-orange-100 to-orange-50 flex items-center justify-center"> ${renderComponent($$result2, "CaracteristicaSection", $$CharacteristicsSection, {})} </div> ` })}`;
}, "C:/Proyectos/MVA-FOOD/src/pages/caracteristicas.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/src/pages/caracteristicas.astro";
const $$url = "/caracteristicas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Caracteristicas,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
