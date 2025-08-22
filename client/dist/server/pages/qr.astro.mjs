/* empty css                                           */
import { c as createComponent, b as createAstro, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B7UDdHjm.mjs';
import { $ as $$Layout } from '../chunks/Layout_BQZq4Hzi.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Qr = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Qr;
  const { searchParams } = new URL(Astro2.request.url);
  searchParams.get("url") ?? "https://mva-food.vercel.app/menus/demo-1";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mva Foods - QR" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bg-gray-100 flex justify-center items-center lg:h-screen p-24"> <!-- <QRCodeGenerator client:only url={url} /> --> <form method="post" action="/api/upload" enctype="multipart/form-data" class="space-y-4"> <input type="file" name="file"> <input type="hidden" name="tipo" value="perfil"> <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
Subir Imagen
</button> </form> <p class="mt-6 text-sm text-gray-500">
Las imágenes se mostrarán en: <code>http://localhost:8080/imagenes/nombre.jpg</code> </p> </div> ` })}`;
}, "C:/Proyectos/MVA-FOOD/client/src/pages/qr.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/client/src/pages/qr.astro";
const $$url = "/qr";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Qr,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
