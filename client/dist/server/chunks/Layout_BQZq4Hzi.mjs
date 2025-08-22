import { c as createComponent, m as maybeRenderHead, g as renderScript, a as renderTemplate, r as renderComponent, b as createAstro, d as addAttribute, e as renderHead, f as renderSlot } from './astro/server_B7UDdHjm.mjs';
import 'clsx';
/* empty css                                   */
import { F as Facebook, I as Instagram } from './brand-instagram_COhHV-KZ.mjs';
import { c as createSvgComponent } from './runtime_Bp0Y1_zJ.mjs';
/* empty css                                   */

const $$BackToTop = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Div para observar el scroll y mostrar/ocultar el botón -->${maybeRenderHead()}<div id="scroll-observer" class="pointer-events-none absolute top-[300px] left-0 h-[1px] w-[1px]" aria-hidden="true" data-astro-cid-2ibei3ui></div> <a class="via-theme-orange hover:to-theme-blue fixed right-8 bottom-8 z-40 
  flex h-12 w-12 flex-col items-center justify-center overflow-hidden 
  rounded-full bg-gradient-to-r from-orange-500 to-orange-400 opacity-0 shadow-lg" id="back-to-top" href="#top" aria-label="Volver arriba" data-astro-cid-2ibei3ui> <svg viewBox="0 0 384 512" class="absolute h-5 w-4" data-astro-cid-2ibei3ui> <path fill="#fff" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" data-astro-cid-2ibei3ui></path> </svg> </a>  ${renderScript($$result, "C:/Proyectos/MVA-FOOD/client/src/components/Buttons/BackToTop.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Proyectos/MVA-FOOD/client/src/components/Buttons/BackToTop.astro", void 0);

const X = createSvgComponent({"meta":{"src":"/_astro/brand-x.ATC87rTm.svg","width":24,"height":24,"format":"svg"},"attributes":{"width":"24","height":"24","viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","class":"icon icon-tabler icons-tabler-outline icon-tabler-brand-x"},"children":"<path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\" /><path d=\"M4 4l11.733 16h4.267l-11.733 -16z\" /><path d=\"M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772\" />"});

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="bg-gray-800 text-white py-6"> <div class="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center"> <!-- Logo Section --> <div class="flex items-center mb-4 md:mb-0"> <img src="/mva-logo-rb.png" alt="Logo" class="h-32 w-auto"> </div> <!-- Navigation Section --> <nav class="mb-4 md:mb-0"> <ul class="flex flex-col md:flex-row md:space-x-6"> <li class="hover:underline hover:text-orange-600"> <a href="/politica-privacidad">Política de privacidad</a> </li> <li class="hover:underline hover:text-orange-600"> <a href="/terminos-servicio">Términos de servicio</a> </li> <li class="hover:underline hover:text-orange-600"> <a href="/contactos">Contactanos</a> </li> </ul> </nav> <!-- Social Media Section --> <div class="flex space-x-6"> <a href="https://www.facebook.com/profile.php?id=61555546550658" target="_blank" class="hover:text-orange-600">${renderComponent($$result, "Fb", Facebook, { "width": 40, "height": 40 })}</a> <a href="https://www.instagram.com/escalatesoftwaresolutions/" target="_blank" class="hover:text-orange-600">${renderComponent($$result, "Ig", Instagram, { "width": 40, "height": 40 })}</a> <a href="#" class="hover:text-orange-600 hidden">${renderComponent($$result, "X", X, { "width": 40, "height": 40 })}</a> </div> </div> <!-- Footer Bottom Section --> <div class="text-center mt-6"> <p>&copy; <span id="year"></span> Mva Foods. All rights reserved.</p> </div> </footer> ${renderScript($$result, "C:/Proyectos/MVA-FOOD/client/src/components/Shared/Footer.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Proyectos/MVA-FOOD/client/src/components/Shared/Footer.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["<!-- Navegaci\xF3n -->", `<nav class="bg-white shadow-md fixed w-full z-50"> <div class="container mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex justify-between items-center py-4"> <!-- Logo --> <a href="/" class="text-2xl font-bold flex items-center"> <img src="/mva-logo-rb.png" alt="Logo" class="h-12 w-12 mr-2"> <h1 class="text-orange-600 hover:text-orange-900 transition-colors duration-300">
Mva Foods
</h1> </a> <!-- Men\xFA para pantallas grandes --> <div class="hidden md:flex space-x-6 text-orange-600 text-xl"> <a href="/" class="hover:text-orange-900">Inicio</a> <a href="/restaurantes" class="hover:text-orange-900">Restaurantes</a> <a href="/caracteristicas" class="hover:text-orange-900">Caracter\xEDsticas</a> <a href="/precios" class="hover:text-orange-900">Precios</a> <a href="/contactos" class="hover:text-orange-900">Contacto</a> </div> <!-- Bot\xF3n de Agendar clientes --> <div class="hidden md:flex"> <a href="/precios" class="bg-[#D96D2D] text-white px-10 py-2 rounded-full hover:bg-[#5c3016] transition-colors duration-300">
Clientes
</a> </div> <!-- Men\xFA m\xF3vil --> <div class="md:hidden"> <button id="menu-toggle" class="text-orange-600 focus:outline-none text-2xl text-bold">\u2630</button> </div> </div> <!-- Men\xFA m\xF3vil desplegable --> <div id="mobile-menu" class="hidden md:hidden flex-col space-y-2 pb-4"> <a href="/" class="text-orange-600 hover:text-orange-900 block">Inicio</a> <a href="/restaurantes" class="text-orange-600 hover:text-orange-900 block">Restaurantes</a> <a href="/caracteristicas" class="text-orange-600 hover:text-orange-900 block">Caracter\xEDsticas</a> <a href="/precios" class="text-orange-600 hover:text-orange-900 block">Precios</a> <a href="/contactos" class="text-orange-600 hover:text-orange-900 block">Contacto</a> <a href="/precios" class="bg-orange-600 text-white px-4 py-2 rounded-lg text-center hover:bg-orange-900 block">
Clientes
</a> </div> </div> </nav> <!-- JavaScript --> <script type="module">
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const hash = this.getAttribute("href");

      if (hash.startsWith("#")) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
<\/script>`])), maybeRenderHead());
}, "C:/Proyectos/MVA-FOOD/client/src/components/Shared/Header.astro", void 0);

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "",
    description = "MVA-FOOD es una plataforma digital dise\xF1ada para restaurantes y food trucks que buscan modernizar su operaci\xF3n diaria mediante un sistema eficiente de gesti\xF3n de men\xFAs, productos, colaboradores y promociones. Esta aplicaci\xF3n nace con el objetivo de simplificar la administraci\xF3n gastron\xF3mica y ofrecer una experiencia m\xE1s fluida tanto para el personal del establecimiento como para sus clientes."
  } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${title}</title><meta property="og:title"${addAttribute(title, "content")}><meta name="description"${addAttribute(description, "content")}><link rel="icon" type="image/svg+xml" href="/mva-logo-rb.png"><meta property="og:description"${addAttribute(description, "content")}><meta property="og:type" content="website"><meta property="og:image" content="/site.png"><meta property="og:url"${addAttribute(Astro2.url, "content")}><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image" content="/site.png"><link rel="stylesheet" href="/src/styles/global.css">${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "BackToTop", $$BackToTop, {})} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "C:/Proyectos/MVA-FOOD/client/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
