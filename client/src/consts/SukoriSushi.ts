// =============================================================
// SukoriSushi.ts
// Fuente única de datos del restaurante "Sukori Restaurante & Bar"
// Todas las imágenes provienen de Unsplash (https://unsplash.com)
// =============================================================

/** Construye una URL de imagen de Unsplash optimizada */
function img(photoId: string, width = 600): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=80&auto=format&fit=crop`;
}

// -------------------------------------------------------------
// Pools de fotos reales de Unsplash, agrupadas por temática.
// Se reutilizan de forma cíclica dentro de cada sección para
// que cada platillo tenga una imagen ilustrativa.
// -------------------------------------------------------------
const POOL_ROLLS = [
  "1713453018516-b08018818c0c",
  "1579584425555-c3ce17fd4351",
  "1579871494447-9811cf80d66c",
  "1611143669185-af224c5e3252",
  "1617196034796-73dfa7b1fd56",
  "1563612116625-3012372fccce",
  "1633478062482-790e3b5dd810",
  "1582450871972-ab5ca641643d",
  "1607301405418-780ee5e6dd10",
  "1675870791718-a12568cfef43",
  "1730900737644-e146f78db8e7",
];

const POOL_RAMEN_NOODLES = [
  "1569718212165-3a8278d5f624",
  "1623341214825-9f4f963727da",
  "1591325418441-ff678baf78ef",
];

const POOL_TACOS = [
  "1565299585323-38d6b0865b47",
  "1599488400918-5f5f96b3f463",
  "1564767655658-4e6b365884ff",
  "1545093149-618ce3bcf49d",
  "1648437595587-e6a8b0cdf1f9",
  "1613514785940-daed07799d9b",
];

const POOL_BOTANAS = [
  "1567620832903-9fc6debc209f",
  "1608039755401-742074f0548d",
  "1585703900468-13c7a978ad86",
  "1637273484026-11d51fb64024",
  "1639131285716-3fc7f624f138",
];

const POOL_POSTRES = [
  "1524351199678-941a58a3df50",
  "1676300185983-d5f242babe34",
  "1702925614886-50ad13c88d3f",
  "1578775887804-699de7086ff9",
  "1547414368-ac947d00b91d",
];

const POOL_ARROZ = [
  "1603133872878-684f208fb84b",
  "1551326844-4df70f78d0e9",
  "1578160112054-954a67602b88",
  "1584269600464-37b1b58a9fe7",
];

const POOL_ENSALADAS = [
  "1546069901-ba9599a7e63c",
  "1623489254660-db5b367881d9",
  "1572449043416-55f4685c9bb7",
];

const POOL_ENTRADAS = [
  ...POOL_ROLLS.slice(0, 4),
  ...POOL_TACOS.slice(0, 2),
  ...POOL_ENSALADAS,
];

function pick(pool: string[], i: number, width = 600): string {
  return img(pool[i % pool.length], width);
}

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export interface PrecioOpcion {
  etiqueta: string;
  valor: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: string;
  precios?: PrecioOpcion[];
  nota?: string;
  imagen?: string;
  destacado?: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  imagen: string;
}

export interface SeccionMenu {
  id: string;
  titulo: string;
  imagenPortada?: string;
  productos: Producto[];
}

export interface ComboOpcion {
  nombre: string;
  precio?: string;
}

export interface ComboPaso {
  numero: number;
  titulo: string;
  nota?: string;
  opciones: ComboOpcion[];
}

export interface Charola {
  id: string;
  nombre: string;
  precio: string;
  descripcion: string;
  imagen: string;
}

// -------------------------------------------------------------
// Datos del restaurante
// -------------------------------------------------------------
export const SukoriSushi = {
  // ---- Información general ----
  nombre: "Sukori Restaurante & Bar",
  eslogan: "Restaurante & Bar",
  whatsapp: "5218000000000",
  telefono: "+528000000000",
  logo: img("1611143669185-af224c5e3252", 200),

  // ---- Categorías (barra superior) ----
  categorias: [
    { id: "combos", nombre: "Combos", imagen: img(POOL_ROLLS[0], 150) },
    { id: "rollos-frios", nombre: "Rollos Fríos", imagen: img(POOL_ROLLS[1], 150) },
    { id: "rollos-calientes", nombre: "Rollos Calientes", imagen: img(POOL_ROLLS[4], 150) },
    { id: "especialidades", nombre: "Especialidades", imagen: img(POOL_RAMEN_NOODLES[0], 150) },
    { id: "botanas", nombre: "Botanas", imagen: img(POOL_BOTANAS[0], 150) },
    { id: "tacos", nombre: "Tacos", imagen: img(POOL_TACOS[0], 150) },
    { id: "entradas", nombre: "Entradas", imagen: img(POOL_ROLLS[2], 150) },
    { id: "ensaladas", nombre: "Ensaladas", imagen: img(POOL_ENSALADAS[0], 150) },
    { id: "arroz", nombre: "Arroz", imagen: img(POOL_ARROZ[0], 150) },
    { id: "postres", nombre: "Postres", imagen: img(POOL_POSTRES[0], 150) },
    { id: "sukoritos", nombre: "Sukoritos", imagen: img(POOL_BOTANAS[4], 150) },
    { id: "charolas", nombre: "Charolas", imagen: img(POOL_ROLLS[6], 150) },
  ] as Categoria[],

  // ---- COMBOS (armado en 3 pasos) ----
  combos: {
    titulo: "Combos",
    imagenPortada: img(POOL_ROLLS[8], 800),
    pasos: [
      {
        numero: 1,
        titulo: "Elige tu complemento",
        opciones: [
          { nombre: "Kushiages", precio: "$179" },
          { nombre: "Noodles Pollo", precio: "$199" },
          { nombre: "Noodles Camarón", precio: "$219" },
          { nombre: "Gyozas", precio: "$189" },
          { nombre: "Boneless", precio: "$199" },
          { nombre: "Noodles Res", precio: "$209" },
          { nombre: "Noodles Mixtos", precio: "$219" },
        ],
      },
      {
        numero: 2,
        titulo: "Elige tu ½ rollo",
        nota: "O elige rollo completo por +$89",
        opciones: [
          { nombre: "California Roll" },
          { nombre: "Spicy Roll" },
          { nombre: "Tokio Roll" },
          { nombre: "Yoshi Roll" },
          { nombre: "Cosimo Roll" },
        ],
      },
      {
        numero: 3,
        titulo: "Elige arroz o ensalada",
        opciones: [
          { nombre: "Arroz" },
          { nombre: "Arroz mixto (res, pollo, camarón)", precio: "+$75" },
          { nombre: "Ensalada sunomono" },
          { nombre: "Ensalada sunomono con camarón", precio: "+$65" },
        ],
      },
    ] as ComboPaso[],
  },

  // ---- CHAROLAS ----
  charolas: [
    {
      id: "charola-sukori",
      nombre: "Charola Sukori",
      precio: "$495",
      descripcion:
        "2 rollos, boneless, arroz frito y papas a la francesa. Aplica en rollos: Tokio, Cosimo, Yoshi, Spicy y California.",
      imagen: img(POOL_ROLLS[5], 800),
    },
    {
      id: "charola-tokio",
      nombre: "Charola Tokio",
      precio: "$395",
      descripcion:
        "2 rollos Tokio o Yoshi, tampico, arroz frito o ensalada sunomono.",
      imagen: img(POOL_ROLLS[7], 800),
    },
  ] as Charola[],

  // ---- ROLLOS FRÍOS ----
  rollosFrios: {
    titulo: "Rollos Fríos",
    productos: [
      {
        id: "california-roll",
        nombre: "California Roll",
        descripcion: "Surimi, pepino, aguacate y arroz gohan.",
        precio: "$149",
        nota: "Nevado +$159",
        imagen: pick(POOL_ROLLS, 0, 700),
      },
      {
        id: "spicy-roll",
        nombre: "Spicy Roll",
        descripcion:
          "Aguacate, pepino y surimi por dentro, arroz gohan, cebollín y tu proteína favorita en salsa spicy: camarón, atún o salmón.",
        precio: "$179",
        imagen: pick(POOL_ROLLS, 1, 700),
      },
      {
        id: "blitzer-roll",
        nombre: "Blitzer Roll",
        descripcion:
          "Camarón, tampico, queso crema por dentro, arroz gohan, aguacate, cangrejo, masago y crunch.",
        precio: "$199",
        imagen: pick(POOL_ROLLS, 2, 700),
      },
      {
        id: "mango-roll",
        nombre: "Mango Roll",
        descripcion:
          "Camarón, cangrejo, spicy, queso crema, aguacate, pepino por dentro, arroz y mango por fuera con un toque de salsa de anguila y serrano.",
        precio: "$199",
        imagen: pick(POOL_ROLLS, 3, 700),
      },
      {
        id: "tigre-roll",
        nombre: "Tigre Roll",
        descripcion:
          "Camarón, tampico, queso crema por dentro, kanikama, anguila, massago, ponzu por fuera.",
        precio: "$209",
        imagen: pick(POOL_ROLLS, 4, 700),
      },
      {
        id: "crunch-roll",
        nombre: "Crunch Roll",
        descripcion:
          "Camarón, cangrejo, spicy mayo, queso crema, aguacate, pepino por dentro, salmón, mayo trufa, cebollín y massago por fuera.",
        precio: "$219",
        imagen: pick(POOL_ROLLS, 5, 700),
      },
      {
        id: "ronin-roll",
        nombre: "Ronin Roll",
        descripcion:
          "Cangrejo, spicy mayo, camarón, pepino, aguacate, queso crema por dentro, massago y chispas tempura, cebollín, anguila y ají amarillo por fuera.",
        precio: "$219",
        imagen: pick(POOL_ROLLS, 6, 700),
      },
    ] as Producto[],
  },

  // ---- ROLLOS CALIENTES ----
  rollosCalientes: {
    titulo: "Rollos Calientes",
    productos: [
      {
        id: "tokio-roll",
        nombre: "Tokio Roll",
        descripcion:
          "Camarón, aguacate, queso crema por dentro y arroz frito por fuera. Empanizado o capeado.",
        precio: "$179",
        imagen: pick(POOL_ROLLS, 7, 700),
      },
      {
        id: "yoshi-roll",
        nombre: "Yoshi Roll",
        descripcion:
          "Pollo, aguacate, queso crema por dentro, arroz frito y empanizado por fuera.",
        precio: "$169",
        imagen: pick(POOL_ROLLS, 8, 700),
      },
      {
        id: "cosimo-roll",
        nombre: "Cosimo Roll",
        descripcion:
          "Estilo tempura, relleno de camarón, queso crema y aguacate con topping de tampico, salsa anguila y furikake.",
        precio: "$179",
        imagen: pick(POOL_ROLLS, 9, 700),
      },
      {
        id: "smash-roll",
        nombre: "Smash Roll",
        descripcion:
          "Camarón empanizado, aguacate, queso crema y chispas tempura por dentro, arroz frito y surimi por fuera en tempura.",
        precio: "$189",
        imagen: pick(POOL_ROLLS, 10, 700),
      },
      {
        id: "cornelio-roll",
        nombre: "Cornelio Roll",
        descripcion:
          "Aguacate, surimi, queso crema, pepino por dentro, camarón empanizado, chipotle y elote tempura por fuera.",
        precio: "$179",
        imagen: pick(POOL_ROLLS, 0, 700),
      },
      {
        id: "pirata-roll",
        nombre: "Pirata Roll",
        descripcion:
          "Filete de res, aguacate, queso crema, surimi, arroz frito empanizado por fuera.",
        precio: "$179",
        imagen: pick(POOL_ROLLS, 1, 700),
      },
      {
        id: "lava-roll",
        nombre: "Lava Roll",
        descripcion:
          "Kanikama, pepino, aguacate por dentro, salsa spicy, flameado, queso gratinado y topping de camarón tempura.",
        nota: "20 min de preparación",
        precio: "$199",
        imagen: pick(POOL_ROLLS, 2, 700),
      },
      {
        id: "trufa-roll",
        nombre: "Trufa Roll",
        descripcion:
          "Salmón, mayonesa trufada por fuera, arroz frito, camarón, aguacate, queso crema por fuera empanizado.",
        precio: "$219",
        imagen: pick(POOL_ROLLS, 3, 700),
      },
      {
        id: "otaku-roll",
        nombre: "Otaku Roll",
        descripcion:
          "Kanikama spicy, cebollín por fuera empanizado, camarón, queso crema, aguacate y arroz frito por dentro.",
        precio: "$199",
        imagen: pick(POOL_ROLLS, 4, 700),
      },
    ] as Producto[],
  },

  // ---- ESPECIALIDADES ----
  especialidades: {
    titulo: "Especialidades",
    productos: [
      {
        id: "filete-pescado",
        nombre: "Filete de Pescado al Gusto",
        descripcion:
          "Empanizado o a la plancha, acompañado de papas a la francesa, arroz y ensalada.",
        precio: "$239",
        imagen: pick(POOL_TACOS, 0, 700),
      },
      {
        id: "orange-chicken",
        nombre: "Orange Chicken",
        descripcion:
          "Pollo empanizado bañado en nuestra salsa a la naranja especial, montado sobre arroz frito.",
        precio: "$198",
        imagen: pick(POOL_BOTANAS, 0, 700),
      },
      {
        id: "pechuga-chipotle",
        nombre: "Pechuga al Chipotle",
        descripcion:
          "Bañada en nuestra exquisita crema chipotle, acompañada de ensalada y arroz frito.",
        precio: "$229",
        imagen: pick(POOL_BOTANAS, 1, 700),
      },
      {
        id: "noodles-sukori",
        nombre: "Noodles Sukori",
        descripcion: "Mezcla perfecta de vegetales y tus proteínas favoritas.",
        precios: [
          { etiqueta: "Camarón", valor: "$285" },
          { etiqueta: "Pollo", valor: "$285" },
          { etiqueta: "Res", valor: "$285" },
          { etiqueta: "Mixto", valor: "$285" },
        ],
        imagen: pick(POOL_RAMEN_NOODLES, 0, 700),
      },
      {
        id: "sushi-burger",
        nombre: "Sushi Burger",
        descripcion:
          "Deliciosa combinación de arroz sazonado con aguacate y tampico, empanizada por fuera (camarón o pollo).",
        precio: "$219",
        imagen: pick(POOL_ROLLS, 5, 700),
      },
      {
        id: "teppanyaki",
        nombre: "Teppanyaki",
        descripcion: "Parrillada tradicional japonesa.",
        precios: [
          { etiqueta: "Camarón", valor: "$298" },
          { etiqueta: "Pollo", valor: "$298" },
          { etiqueta: "Res", valor: "$298" },
          { etiqueta: "Mixto", valor: "$298" },
        ],
        imagen: pick(POOL_ARROZ, 0, 700),
      },
      {
        id: "ramen",
        nombre: "Ramen",
        descripcion:
          "Riquísimo caldo japonés, receta especial hecha en casa, pídelo como más te guste: camarón, pollo, res, cerdo o mixto.",
        precio: "$189",
        imagen: pick(POOL_RAMEN_NOODLES, 1, 700),
      },
      {
        id: "orden-arrachera",
        nombre: "Orden de Arrachera",
        descripcion:
          "En el término de tu preferencia, acompañado de cebolla, chiles toreados y papas a la francesa.",
        precio: "$419",
        imagen: pick(POOL_TACOS, 1, 700),
      },
    ] as Producto[],
  },

  // ---- BOTANAS ----
  botanas: {
    titulo: "Botanas",
    imagenPortada: img(POOL_BOTANAS[3], 800),
    productos: [
      {
        id: "botana-katana",
        nombre: "Botana Katana",
        descripcion:
          "Tiras de pollo crispy, medio tokio roll, papas a la francesa, ensalada sunomono o arroz frito.",
        precio: "$229",
        imagen: pick(POOL_BOTANAS, 2, 700),
      },
      {
        id: "boneless",
        nombre: "Boneless",
        descripcion:
          "Recién hechos, montados sobre arroz frito. Pídelos en tu salsa favorita: picosita, mango habanero, a la naranja, ajo-parmesano o chipotle.",
        precio: "$199",
        imagen: pick(POOL_BOTANAS, 3, 700),
      },
      {
        id: "botana-pacman",
        nombre: "Botana Pac-Man",
        descripcion:
          "Perfecta combinación de pollo crispy picosito, pollo crispy original, dedos mozzarella y papas sazonadas.",
        precio: "$229",
        imagen: pick(POOL_BOTANAS, 4, 700),
      },
    ] as Producto[],
  },

  // ---- TACOS ----
  tacos: {
    titulo: "Tacos",
    productos: [
      {
        id: "tacos-jefe",
        nombre: "Tacos del Jefe",
        descripcion:
          "Laja de Rib eye con costra de queso asadero, frijoles refritos y tuétano.",
        precio: "$295",
        imagen: pick(POOL_TACOS, 2, 700),
      },
      {
        id: "tacos-arrachera",
        nombre: "Tacos Arrachera",
        descripcion:
          "En maíz o harina, acompañados de frijoles refritos, cebolla y toreados.",
        precio: "$259",
        nota: "Queso extra $39 · Aguacate extra $39",
        imagen: pick(POOL_TACOS, 3, 700),
      },
      {
        id: "tacos-camaron",
        nombre: "Tacos Camarón",
        descripcion:
          "Camarones empanizados, queso manchego y aderezo chipotle. Pídelos en hoja de lechuga.",
        nota: "2 piezas",
        precio: "$149",
        imagen: pick(POOL_TACOS, 4, 700),
      },
      {
        id: "tacos-sirlon",
        nombre: "Tacos de Sirlon",
        descripcion:
          "Suaves y jugosas doradas con tuétano acompañadas con cebolla y cilantro.",
        nota: "4 piezas",
        precio: "$229",
        imagen: pick(POOL_TACOS, 5, 700),
      },
      {
        id: "tacos-capibara",
        nombre: "Tacos Capibara",
        descripcion:
          "Arrachera, ajo rostizado, tuétano, cilantro, cebolla, limón, preparado en la mesa.",
        precio: "$279",
        imagen: pick(POOL_TACOS, 0, 700),
      },
      {
        id: "taco-pirata",
        nombre: "Taco Pirata",
        descripcion:
          "El tradicional con un toque especial Sukori, mezcla de quesos y suave carne de res.",
        precio: "$219",
        imagen: pick(POOL_TACOS, 1, 700),
      },
    ] as Producto[],
  },

  // ---- ENTRADAS ----
  entradas: {
    titulo: "Entradas",
    productos: [
      {
        id: "nigiris-sukori",
        nombre: "Nigiris Sukori",
        descripcion:
          "Gunkam camarón al mojo, pesca blanca, salmón y huevo de codorniz.",
        precios: [
          { etiqueta: "Gunkam Camarón al Mojo", valor: "$49" },
          { etiqueta: "Pesca Blanca", valor: "$49" },
          { etiqueta: "Salmón y huevo de codorniz", valor: "$55" },
        ],
        imagen: pick(POOL_ENTRADAS, 0, 700),
      },
      {
        id: "chicharron-arrachera",
        nombre: "Chicharrón Arrachera",
        descripcion:
          "Crujiente por fuera y suave por dentro, acompañado de guacamole y pico de gallo.",
        precio: "$349",
        imagen: pick(POOL_ENTRADAS, 1, 700),
      },
      {
        id: "gyozas",
        nombre: "Gyozas",
        descripcion: "Empanadillas japonesas rellenas de carne de puerco y verduras.",
        precio: "$169",
        imagen: pick(POOL_ENTRADAS, 2, 700),
      },
      {
        id: "edamames",
        nombre: "Edamames",
        descripcion: "Naturales o preparados con nuestra salsa picosita de la casa.",
        precio: "$149",
        imagen: pick(POOL_ENTRADAS, 3, 700),
      },
      {
        id: "camarones-roca",
        nombre: "Camarones Roca",
        descripcion:
          "Capeados y aderezados con nuestra preparación especial de salsa.",
        precio: "$199",
        imagen: pick(POOL_ENTRADAS, 4, 700),
      },
      {
        id: "kushiages",
        nombre: "Kushiages",
        descripcion: "Deliciosas brochetas de queso preparadas al momento.",
        precio: "$145",
        imagen: pick(POOL_ENTRADAS, 5, 700),
      },
      {
        id: "sashimi-salmon-bulma",
        nombre: "Sashimi Salmón Bulma",
        descripcion:
          "Láminas de salmón fresco marinadas en nuestra salsa especial ponzu-akira, acompañado de cebolla, serrano, cilantro y arroz frito.",
        precio: "$279",
        imagen: pick(POOL_ENTRADAS, 6, 700),
      },
      {
        id: "verduras-tempura",
        nombre: "Verduras Tempura",
        descripcion: "Receta especial acompañada de un aderezo de la casa.",
        precio: "$179",
        imagen: pick(POOL_ENTRADAS, 0, 700),
      },
      {
        id: "papas-spicy",
        nombre: "Papas Spicy",
        descripcion:
          "Papitas cambray bañadas en salsa picosita acompañadas de sirlon.",
        precio: "$185",
        imagen: pick(POOL_BOTANAS, 1, 700),
      },
      {
        id: "papas-trufa-parmesano",
        nombre: "Papas Trufa-Parmesano",
        descripcion:
          "Papitas a la francesa, acompañadas de ranch y catsup siracha.",
        precio: "$165",
        imagen: pick(POOL_BOTANAS, 2, 700),
      },
      {
        id: "guacamole",
        nombre: "Guacamole",
        descripcion: "Acompañado de pico de gallo.",
        precio: "$145",
        imagen: pick(POOL_TACOS, 2, 700),
      },
      {
        id: "queso-fundido",
        nombre: "Queso Fundido",
        descripcion: "Fundido con champiñones, chorizo o ajo.",
        precio: "$145",
        imagen: pick(POOL_TACOS, 3, 700),
      },
      {
        id: "coctel-camaron",
        nombre: "Coctel de Camarón",
        descripcion:
          "Camarones frescos, pico de gallo, aguacate en una salsa especial de la casa.",
        precio: "$185",
        imagen: pick(POOL_ENSALADAS, 0, 700),
      },
      {
        id: "tostada-atun",
        nombre: "Tostada de Atún",
        descripcion:
          "Dos tostadas crujientes con atún fresco, pepino, cebolla, aguacate y mango.",
        precio: "$185",
        imagen: pick(POOL_ROLLS, 6, 700),
      },
    ] as Producto[],
  },

  // ---- ENSALADAS ----
  ensaladas: {
    titulo: "Ensaladas",
    productos: [
      {
        id: "ensalada-sunomono",
        nombre: "Ensalada Sunomono",
        descripcion: "Cangrejo y pepino rallado en nuestro aderezo de la casa.",
        precios: [
          { etiqueta: "Camarón", valor: "$169" },
          { etiqueta: "Atún", valor: "$185" },
          { etiqueta: "Salmón", valor: "$205" },
          { etiqueta: "Mixta", valor: "$199" },
        ],
        imagen: pick(POOL_ENSALADAS, 0, 700),
      },
      {
        id: "ensalada-crispy",
        nombre: "Ensalada Crispy",
        descripcion:
          "Mezcla de lechuga, col morada, zanahoria, almendras, arándanos, tomate cherry y pollo crispy. Pídelo natural o búfalo.",
        precios: [
          { etiqueta: "Media", valor: "$139" },
          { etiqueta: "Completa", valor: "$195" },
        ],
        imagen: pick(POOL_ENSALADAS, 1, 700),
      },
    ] as Producto[],
  },

  // ---- ARROZ ----
  arroz: {
    titulo: "Arroz",
    productos: [
      {
        id: "arroz-frito",
        nombre: "Arroz Frito",
        precios: [
          { etiqueta: "Res", valor: "$165" },
          { etiqueta: "Verduras", valor: "$135" },
          { etiqueta: "Pollo", valor: "$145" },
          { etiqueta: "Camarón", valor: "$165" },
          { etiqueta: "Mixto", valor: "$175" },
        ],
        nota: "Agrega queso crema y aguacate por $29 c/u",
        imagen: pick(POOL_ARROZ, 0, 700),
      },
      {
        id: "arroz-cobra-kai",
        nombre: "Arroz Cobra Kai",
        descripcion:
          "Arroz frito, camarón o pollo empanizado, aguacate, queso crema y kanikama.",
        precio: "$185",
        imagen: pick(POOL_ARROZ, 1, 700),
      },
      {
        id: "arroz-miyagi",
        nombre: "Arroz Miyagi",
        descripcion: "Arroz frito al ajillo, carne de res y champiñones.",
        precio: "$185",
        imagen: pick(POOL_ARROZ, 2, 700),
      },
      {
        id: "gohan-especial",
        nombre: "Gohan Especial",
        descripcion: "Arroz gohan, tampico, aguacate, queso crema y anguila.",
        precio: "$155",
        imagen: pick(POOL_ARROZ, 3, 700),
      },
      {
        id: "arroz-meloso",
        nombre: "Arroz Meloso",
        descripcion:
          "Crema de chipotle y trufa con la proteína a elegir y vegetales.",
        precios: [
          { etiqueta: "Camarón", valor: "$185" },
          { etiqueta: "Pollo", valor: "$175" },
          { etiqueta: "Res", valor: "$185" },
          { etiqueta: "Mixto", valor: "$205" },
        ],
        imagen: pick(POOL_ARROZ, 0, 700),
      },
    ] as Producto[],
  },

  // ---- POSTRES ----
  postres: {
    titulo: "Postres",
    productos: [
      {
        id: "oreo-pancakes",
        nombre: "Oreo Pancakes",
        descripcion:
          "Galleta oreo cubierta con una ligera capa de pan exquisito, acompañado con nieve de vainilla.",
        precio: "$139",
        imagen: pick(POOL_POSTRES, 0, 700),
      },
      {
        id: "mostachon",
        nombre: "Mostachón",
        descripcion: "El famoso, pídelo de mango o nuez.",
        precio: "$139",
        imagen: pick(POOL_POSTRES, 1, 700),
      },
      {
        id: "cheesecake-totti",
        nombre: "Cheesecake Totti",
        descripcion:
          "Fusión de cheesecake con brownie acompañado de nieve de vainilla y polvo de mazapán.",
        precio: "$149",
        imagen: pick(POOL_POSTRES, 2, 700),
      },
      {
        id: "pastel-lotus",
        nombre: "Pastel de Lotus",
        descripcion: "Tarta de galleta lotus, nieve de vainilla y crema lotus.",
        precio: "$179",
        imagen: pick(POOL_POSTRES, 3, 700),
      },
      {
        id: "cookie-cake",
        nombre: "Cookie Cake",
        descripcion:
          "Fusión de brownie, galletas de chispas de chocolate acompañado de nieve.",
        precio: "$149",
        imagen: pick(POOL_POSTRES, 4, 700),
      },
    ] as Producto[],
  },

  // ---- SUKORITOS (menú infantil) ----
  sukoritos: {
    titulo: "Sukoritos",
    productos: [
      {
        id: "crispy-infantil",
        nombre: "Crispy Infantil",
        descripcion: "Pollo Crispy y papas a la francesa.",
        precio: "$145",
        imagen: pick(POOL_BOTANAS, 4, 700),
      },
      {
        id: "boneless-infantil",
        nombre: "Boneless Infantil",
        descripcion: "Boneless y papas a la francesa.",
        precio: "$145",
        imagen: pick(POOL_BOTANAS, 3, 700),
      },
      {
        id: "yoshi-infantil",
        nombre: "Yoshi Infantil",
        descripcion: "Medio Yoshi roll y papas a la francesa.",
        precio: "$145",
        imagen: pick(POOL_ROLLS, 8, 700),
      },
      {
        id: "tokio-infantil",
        nombre: "Tokio Infantil",
        descripcion: "Medio Tokio roll y papas a la francesa.",
        precio: "$145",
        imagen: pick(POOL_ROLLS, 7, 700),
      },
    ] as Producto[],
  },
};

export default SukoriSushi;
