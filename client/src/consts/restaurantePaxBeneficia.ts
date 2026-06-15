export const restaurantePaxBeneficia = {
  nombre: "Pax & Beneficia",
  telefono: "+525551234567",
  whatsapp: "+525551234567",

  categorias: [
    {
      id: "all",
      nombre: "Todo",
      icono: "🍽️",
    },
    {
      id: "desayunos",
      nombre: "Desayunos",
      imagen: "https://picsum.photos/200?1",
    },
    {
      id: "almuerzos",
      nombre: "Almuerzos",
      imagen: "https://picsum.photos/200?2",
    },
    {
      id: "cenas",
      nombre: "Cenas",
      imagen: "https://picsum.photos/200?3",
    },
    {
      id: "bebidas",
      nombre: "Bebidas",
      imagen: "https://picsum.photos/200?4",
    },
    {
      id: "postres",
      nombre: "Postres",
      imagen: "https://picsum.photos/200?5",
    },
  ],

  platos: [
    {
      id: 1,
      categoriaId: "desayunos",
      nombre: "Croquetas Caseras",
      descripcion:
        "Croquetas cremosas de jamón ibérico, crujientes por fuera y suaves por dentro.",
      precio: 7,
      imagen: "https://picsum.photos/800?11",
      likes: 32,
      recomendado: true,
    },
    {
      id: 2,
      categoriaId: "almuerzos",
      nombre: "Paella Mixta",
      descripcion:
        "Paella tradicional española preparada con ingredientes frescos.",
      precio: 125,
      imagen: "https://picsum.photos/800?12",
      likes: 75,
      recomendado: true,
    },
    {
      id: 3,
      categoriaId: "almuerzos",
      nombre: "Patatas Bravas",
      descripcion:
        "Patatas crujientes acompañadas con salsa brava casera.",
      precio: 55,
      imagen: "https://picsum.photos/800?13",
      likes: 28,
      recomendado: true,
    },
    {
      id: 4,
      categoriaId: "cenas",
      nombre: "Tortilla Española",
      descripcion:
        "Tortilla española tradicional elaborada con huevos y patatas.",
      precio: 64,
      imagen: "https://picsum.photos/800?14",
      likes: 44,
      recomendado: true,
    },
    {
      id: 5,
      categoriaId: "bebidas",
      nombre: "Café Americano",
      descripcion:
        "Café recién preparado.",
      precio: 25,
      imagen: "https://picsum.photos/800?15",
      likes: 19,
      recomendado: false,
    },
    {
      id: 6,
      categoriaId: "postres",
      nombre: "Cheesecake",
      descripcion:
        "Cheesecake artesanal con frutos rojos.",
      precio: 60,
      imagen: "https://picsum.photos/800?16",
      likes: 51,
      recomendado: false,
    },
  ],
};