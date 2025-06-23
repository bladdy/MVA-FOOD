/* empty css                                           */
import { c as createComponent, a as createAstro, f as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_cUBcAsSp.mjs';
import { $ as $$Layout } from '../chunks/Layout_BfXVipIs.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Qr = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Qr;
  const { searchParams } = new URL(Astro2.request.url);
  const url = searchParams.get("url") ?? "https://mva-food.vercel.app/menus/demo-1";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mva Foods - QR" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bg-gray-100 flex justify-center items-center lg:h-screen p-24"> ${renderComponent($$result2, "QRCodeGenerator", null, { "client:only": true, "url": url, "client:component-hydration": "only", "client:component-path": "@/React/Buttons/QRWithLogoButton", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Proyectos/MVA-FOOD/src/pages/qr.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/src/pages/qr.astro";
const $$url = "/qr";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Qr,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
