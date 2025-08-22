/* empty css                                           */
import { c as createComponent, m as maybeRenderHead, e as renderTemplate, a as createAstro, b as addAttribute, d as renderSlot, f as renderComponent, h as renderScript } from '../chunks/astro/server_cUBcAsSp.mjs';
import 'clsx';
import { $ as $$Layout } from '../chunks/Layout_BQDkqvWR.mjs';
import '../chunks/index_CCxZAn8N.mjs';
import { $ as $$Image } from '../chunks/_astro_assets_Dlbi3CCo.mjs';
import { $ as $$CharacteristicsSection } from '../chunks/CharacteristicsSection_xXhyn1Df.mjs';
import { c as createSvgComponent } from '../chunks/runtime_C0IVtbA6.mjs';
import { $ as $$ContactoSection } from '../chunks/ContactoSection_CDN5Tchx.mjs';
export { renderers } from '../renderers.mjs';

const $$HomeSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="inicio" class="relative py-20 bg-gradient-to-r
 from-white to-gray-100 pt-36 lg:h-screen"> <!-- Banner Content --> <div class="container mx-auto px-4 relative z-10"> <div class="flex flex-col lg:flex-row items-center justify-between"> <!-- Text Content --> <div class="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0"> <div class="w-5/6 mx-auto lg:pl-11 lg:mx-0"> <h2 class="text-4xl lg:text-6xl font-bold text-orange-600 mb-4">El Menú de tu Restaurante en la mano de tu Cliente</h2> <p class="text-lg lg:text-2xl text-gray-700 mb-8">Permite a tus clientes poder consultar tu menú siempre actualizado mediante un código QR o con un enlace desde tu página web.</p> <!-- Mobile Button --> <div class="block md:hidden"> <a href="../login/" class="bg-orange-600 text-white px-8 py-3 rounded-full">Área de Clientes</a> </div> </div> </div> <!-- Image Section --> <div class="lg:w-1/2 mt-8 lg:mt-0"> <div class="flex justify-center lg:justify-end"> <img src="img/wr-rest.jpg" alt="App Banner" class="w-full max-w-xs lg:max-w-2xl rounded-tl-[120px] rounded-br-[120px]"> </div> </div> </div> </div> <!-- Counter Section --> <div class="mt-20"> <div class="container mx-auto text-center px-4"> <h2 class="text-3xl font-semibold text-orange-600 mb-12 px-12">Ventajas de Usar Tu Menú en QR</h2> <div class="grid grid-cols-1 sm:grid-cols-2 
            lg:grid-cols-4 gap-12 w-4/5 mx-auto"> <div class="p-4 bg-white shadow-md rounded-lg text-center"> <h4 class="text-2xl font-semibold text-orange-600 mb-3">Segura e Higiénica</h4> <p class="text-gray-600">Tus clientes podrán consultar tu Menú de una manera segura, limpia e higiénica, evitando cualquier contagio.</p> </div> <div class="p-4 bg-white shadow-md rounded-lg text-center"> <h4 class="text-2xl font-semibold text-orange-600 mb-3">Minimiza Gastos</h4> <p class="text-gray-600">Reduce los costos de imprimir tu Menú en papel que además no permiten actualizarse frecuentemente.</p> </div> <div class="p-4 bg-white shadow-md rounded-lg text-center"> <h4 class="text-2xl font-semibold text-orange-600 mb-3">Siempre al Día</h4> <p class="text-gray-600">Mantén tu Menú constantemente actualizado tanto en precios como en el detalle y fotos de tus platos.</p> </div> <div class="p-4 bg-white shadow-md rounded-lg text-center"> <h4 class="text-2xl font-semibold text-orange-600 mb-3">Autogestionable</h4> <p class="text-gray-600">Gestiona la información de tu establecimiento y tu Menú desde tu computador o tu móvil fácil e intuitivamente sin conocimientos previos.</p> </div> </div> </div> </div> </section>`;
}, "C:/Proyectos/MVA-FOOD/client/src/components/Sections/HomeSection.astro", void 0);

const $$Astro$1 = createAstro();
const $$Restaurant = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Restaurant;
  const { href } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")} rel="noopener noreferrer" class="flex flex-col items-center justify-center px-2 py-2 rounded-full border transition-colors text-center shadow-sm w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"> ${renderSlot($$result, $$slots["default"])} </a>`;
}, "C:/Proyectos/MVA-FOOD/client/src/components/Restaurant.astro", void 0);

const $$RestaurantsBarSection = createComponent(($$result, $$props, $$slots) => {
  const restaurants = [
    {
      slug: "burguer",
      name: "Burguer",
      image: "https://centrosantafe.com.mx/cdn/shop/files/701.png?v=5733697768863393566"
    },
    {
      slug: "kfc",
      name: "KFC",
      image: "https://1000marcas.net/wp-content/uploads/2020/01/KFC-logo.png"
    },
    {
      slug: "mcdonalds",
      name: "McDonalds",
      image: "https://1000marcas.net/wp-content/uploads/2019/11/McDonalds-logo.png"
    },
    {
      slug: "pizza-hut",
      name: "Pizza Hut",
      image: "https://1000marcas.net/wp-content/uploads/2020/01/Pizza-Hut-logo.png"
    },
    {
      slug: "dominos",
      name: "Dominos",
      image: "https://1000marcas.net/wp-content/uploads/2020/01/Logo-Dominos.png"
    },
    {
      slug: "subway",
      name: "Subway",
      image: "https://1000marcas.net/wp-content/uploads/2020/03/Logo-Subway.png"
    },
    {
      slug: "starbucks",
      name: "Starbucks",
      image: "https://1000marcas.net/wp-content/uploads/2019/12/Starbucks-Logo.png"
    },
    {
      slug: "taco-bell",
      name: "Taco Bell",
      image: "https://1000marcas.net/wp-content/uploads/2020/03/Logo-Taco-Bell.png"
    },
    {
      slug: "carls-jr",
      name: "Carls Jr",
      image: "https://1000marcas.net/wp-content/uploads/2021/02/Carls-Jr.-Logo.png"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="features" class="pt-20 px-12 hidden"> <div class="text-center mb-16 pt-16"> <h2 class="text-4xl font-semibold text-orange-600 mb-4">
Nuestros Clientes
</h2> <p class="text-2xl text-gray-700">
Descubre una variedad de restaurantes que ofrecen deliciosos platos.
</p> </div> <!-- Grid container --> <div class="max-w-5xl mx-auto mt-10"> <div class="flex flex-wrap justify-center gap-4 mb-6"> ${restaurants.map((restaurant) => renderTemplate`<div class="flex justify-center items-center"> ${renderComponent($$result, "Restaurant", $$Restaurant, { "href": `/restaurant/${restaurant.slug}` }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Image", $$Image, { "src": restaurant.image, "alt": restaurant.name, "title": restaurant.name, "width": "162", "height": "162", "class": "inline-block w-22 transition-transform group-hover:scale-110" })} ` })} </div>`)} </div> </div> <div class="text-center mt-8"> <a href="#" class="bg-orange-600 text-white px-8 py-3 hover:bg-orange-600 rounded-full">Ver Más</a> </div> </section>`;
}, "C:/Proyectos/MVA-FOOD/client/src/components/Sections/RestaurantsBarSection.astro", void 0);

const $$AdminSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="py-20 bg-gray-100"> <div class="w-full lg:w-4/6 mx-auto px-4 relative z-10 flex flex-col lg:flex-row"> <!-- Imagen a la izquierda --> <div class="lg:w-3/5 mt-8 lg:mt-0 mb-8 lg:mb-0"> <img src="img/admin.png" alt="Logo" class="h-auto w-full lg:h-[500px] object-contain"> </div> <!-- Contenido de texto --> <div class="lg:w-2/5 text-center lg:text-left"> <div class="p-8 max-w-md mx-auto h-full"> <h2 class="text-4xl font-semibold text-orange-600 mb-6">
Todo lo que necesitas para tu menú en nuestra aplicación.
</h2> <!-- Primer punto --> <div class="flex items-start gap-4 mb-8"> <div> <div class="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center"> <p class="text-xl">01</p> </div> </div> <div class="flex flex-col justify-start"> <p class="text-lg text-gray-700 mb-4 text-start">
En nuestra sección administrativa podrás mantener tu menú actualizado con una interfaz intuitiva y fácil de usar.
</p> </div> </div> <!-- Segundo punto --> <div class="flex items-start gap-4 mb-8"> <div> <div class="bg-orange-700 text-white rounded-full w-12 h-12 flex items-center justify-center"> <p class="text-xl">02</p> </div> </div> <div class="flex flex-col justify-start"> <p class="text-lg text-gray-700 mb-4 text-start">
Podrás gestionar toda la información de tu restaurante sin limitaciones en cantidad de categorías o de platos.
</p> </div> </div> </div> </div> </div> </section>`;
}, "C:/Proyectos/MVA-FOOD/client/src/components/Sections/AdminSection.astro", void 0);

const qr = new Proxy({"src":"/_astro/codigo_qr.BUcnPIkV.png","width":300,"height":300,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Proyectos/MVA-FOOD/client/public/img/codigo_qr.png";
							}
							
							return target[name];
						}
					});

const Check = createSvgComponent({"meta":{"src":"/_astro/check.CqKHBtI0.svg","width":24,"height":24,"format":"svg"},"attributes":{"width":"24","height":"24","viewBox":"0 0 24 24","fill":"none","stroke":"currentColor"},"children":"<path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\" /><path d=\"M5 12l5 5l10 -10\" />"});

const $$PreciosSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="precios" class="py-20 px-12"> <div class="text-center mb-16 pt-16 max-w-6xl mx-auto"> <h2 class="text-4xl font-semibold text-orange-600 mb-4">Precios</h2> <p class="text-2xl text-gray-700">
Prueba la aplicación gratis durante 30 días y descubre cómo puede transformar tu restaurante. Ofrecemos planes flexibles para adaptarnos a las necesidades de tu negocio. Elige el que mejor se ajuste a ti.
</p> </div> <div class="max-w-6xl mx-auto grid grid-cols-1 
    md:grid-cols-2 lg:grid-cols-3 gap-8"> <div class="bg-white border-orange-600 border rounded-lg shadow-lg p-4 flex flex-col items-center relative group h-96"> <div> <div class="text-center mb-6 font-bold"> <p class="text-orange-600">PLAN GOLD</p> <p class="text-orange-600">$2000/ANUAL</p> <h3 class="text-3xl text-orange-600">$200/MES</h3> </div> <ul class="list-image-[url(@assets/svg/check.svg)] list-outside mb-4 text-orange-900 "> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Código QR</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Categoría</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Ilimitados platos</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Soporte 24/7</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Totalmente Autogestionable</li> </ul> </div> <a href="/precios" class="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors duration-300 absolute bottom-4">Elegir Plan</a> </div> <div class="bg-white border-orange-600 border rounded-lg shadow-lg p-4 flex flex-col items-center relative group h-96"> <div> <div class="text-center mb-6 font-bold"> <p class="text-orange-600">PLAN PLATINUM</p> <p class="text-orange-600">$3800/ANUAL</p> <h3 class="text-3xl text-orange-600">$380/MES</h3> </div> <ul class="list-image-none list-outside mb-4 text-orange-900"> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Código QR</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Perfil Restaurant</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Menú personalizado</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Categoría</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Ilimitados platos</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Soporte 24/7</li> <li class="flex gap-1">${renderComponent($$result, "Check", Check, {})}Totalmente Autogestionable</li> </ul> </div> <a href="/precios" id="platinunButton" class=" bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors duration-300 absolute bottom-4">Elegir Plan</a> </div> <div class="bg-white border-orange-600 border rounded-lg shadow-lg p-4 flex flex-col items-center relative group h-96"> <div> <div class="text-center mb-6 font-bold"> <p class="text-orange-600">VER DEMO</p> <h3 class="text-3xl text-orange-600">DEMO</h3> </div> </div> ${renderComponent($$result, "Image", $$Image, { "src": qr, "alt": "Qr Demo", "title": "Qr Demo", "width": "162", "height": "162", "class": "inline-block w-22 transition-transform group-hover:scale-110 mb-10" })} <a href="/menus/demo-1" class="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors duration-300 absolute bottom-4">Ver Demo</a> </div> </div> </section> ${renderScript($$result, "C:/Proyectos/MVA-FOOD/client/src/components/Sections/PreciosSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Proyectos/MVA-FOOD/client/src/components/Sections/PreciosSection.astro", void 0);

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mva Foods - Inicio" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HomeSection", $$HomeSection, {})} ${renderComponent($$result2, "CharacteristicsSection", $$CharacteristicsSection, {})} ${renderComponent($$result2, "AdminSection", $$AdminSection, {})} ${renderComponent($$result2, "RestaurantsBarSection", $$RestaurantsBarSection, {})} ${renderComponent($$result2, "PreciosSection", $$PreciosSection, {})} ${renderComponent($$result2, "ContactoSection", $$ContactoSection, {})} ` })}`;
}, "C:/Proyectos/MVA-FOOD/client/src/pages/index.astro", void 0);

const $$file = "C:/Proyectos/MVA-FOOD/client/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
