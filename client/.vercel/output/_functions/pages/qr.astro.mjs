/* empty css                               */
import { c as createComponent, a as createAstro, f as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_-OnrOxK6.mjs';
import { $ as $$Layout } from '../chunks/Layout_DXhUJxF1.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
export { renderers } from '../renderers.mjs';

function QRCodeWithLogo({ url }) {
  const qrRef = useRef(null);
  const qrCode = useRef(null);
  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: 300,
        height: 300,
        data: url,
        image: "img/mr_menus_no.png",
        //Debe estar en /public/
        dotsOptions: {
          color: "#000",
          type: "rounded"
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5,
          imageSize: 0.3
          // Tamaño del logo dentro del QR
        }
      });
    }
    qrCode.current.update({ data: url });
    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
  }, [url]);
  useEffect(() => {
    qrCode.current.update({ data: url });
    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
  }, [url]);
  const handleDownload = () => {
    qrCode.current.download({ name: "codigo_qr", extension: "png" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-6 p-8 w-full mt-10", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800", children: "QR con logo embebido" }),
    /* @__PURE__ */ jsx("div", { ref: qrRef, className: "bg-gray-100 rounded" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleDownload,
        className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition duration-200",
        children: "Descargar QR"
      }
    )
  ] });
}

const $$Astro = createAstro();
const $$Qr = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Qr;
  const { searchParams } = new URL(Astro2.request.url);
  const url = searchParams.get("url") ?? "http://localhost:4321/menus/987c7605-3f17-4547-8806-ed5157666892";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mva Foods - QR" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bg-gray-100 flex justify-center items-center lg:h-screen p-24"> ${renderComponent($$result2, "QRCodeGenerator", QRCodeWithLogo, { "client:load": true, "url": url, "client:component-hydration": "load", "client:component-path": "@/React/Buttons/QRWithLogoButton", "client:component-export": "default" })}<!--  --> <form method="post" action="/api/upload" enctype="multipart/form-data" class="space-y-4"> <input type="file" name="file"> <input type="hidden" name="tipo" value="perfil"> <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
