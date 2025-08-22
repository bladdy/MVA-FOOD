import { c as createComponent, b as createAstro, d as addAttribute, e as renderHead, f as renderSlot, a as renderTemplate } from './astro/server_B7UDdHjm.mjs';
import 'clsx';
/* empty css                                   */

const $$Astro = createAstro();
const $$LayoutMenu = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$LayoutMenu;
  const {
    title = "",
    description = ""
  } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/mva-logo-rb.png"><meta name="generator"${addAttribute(Astro2.generator, "content")}><meta name="keywords" content="menus, comida, comida rapida, delivery, comida saludable"><meta name="author" content="Bladdy Almanzar"><title>${title}</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Proyectos/MVA-FOOD/client/src/layouts/LayoutMenu.astro", void 0);

export { $$LayoutMenu as $ };
