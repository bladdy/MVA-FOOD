/* empty css                               */
import { c as createComponent, f as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_-OnrOxK6.mjs';
import { $ as $$Layout } from '../chunks/Layout_DXhUJxF1.mjs';
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mr. Men\xFAs - Restaurantes", "description": "Encuentra los mejores restaurantes cerca de ti" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="py-20 min-h-screen"> ${renderComponent($$result2, "RestaurantSearchWrapper", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/React/RestaurantSearchWrapper.tsx", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Proyectos/MVA-FOOD/client/src/pages/restaurantes/index.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/client/src/pages/restaurantes/index.astro";
const $$url = "/restaurantes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
