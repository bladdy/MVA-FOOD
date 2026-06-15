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
      imagen:
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=400",
    },
    {
      id: "almuerzos",
      nombre: "Almuerzos",
      imagen:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400",
    },
    {
      id: "cenas",
      nombre: "Cenas",
      imagen:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400",
    },
    {
      id: "bebidas",
      nombre: "Bebidas",
      imagen:
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400",
    },
    {
      id: "postres",
      nombre: "Postres",
      imagen:
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=400",
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
      imagen:
        "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=1200",
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
      imagen:
        "https://images.unsplash.com/photo-1515443961218-a51367888e4b?q=80&w=1200",
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
      imagen:
        "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1200",
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
      imagen:
        "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=1200",
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
      imagen:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200",
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
      imagen:
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1200",
      likes: 51,
      recomendado: false,
    },
  ],
};