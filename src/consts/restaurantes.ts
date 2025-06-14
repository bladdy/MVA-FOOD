import type { Restaurante } from "@/Types/Restaurante";

export const restaurants : Restaurante[] = [
  {
    id: "burguer",
    name: "Burguer",
    image: "https://centrosantafe.com.mx/cdn/shop/files/701.png?v=5733697768863393566",
    tipos: ["Americana", "Tacos"],
    perfilImage: "/img/fast-food-3.jpg",
    direccion: "Federico Geraldino 61, Plaza Laura, local 1 A. Piantini. Santo Domingo. Distrito Nacional.",
    phone: "866 100 2222",
    horario: [
      {
        dia: "Lunes a Viernes",
        apertura: "11:00 AM",
        cierre: "09:00 PM"
      },
      {
        dia: "Sábado",
        apertura: "12:00 AM",
        cierre: "09:00 PM"
      },
      {
        dia: "Domingo",
        apertura: "12:00 PM",
        cierre: "09:00 PM"
      }
    ],
    amnidades: [ 
      {svg:"area-exterior.svg", name:"Area Exterior"}, 
      {svg:"delivery.svg", name:"Delivery"},
      {svg:"wifi.svg", name:"Wifi"}
    ],
    menu: [
      {
        id: "burger-1",
        name: "Hamburguesa Clásica",
        ingredientes: "Carne de res, lechuga, tomate, queso cheddar, pan de hamburguesa, salsa especial",
        price: 180,
        categoria: "Burger & Street Food"
      },
      {
        id: "burger-2",
        name: "Hamburguesa BBQ",
        ingredientes: "Carne de res, cebolla caramelizada, queso cheddar, tocino, salsa BBQ, pan de hamburguesa",
        price: 210,
        categoria: "Burger & Street Food"
      },
      {
        id: "burger-3",
        name: "Papas Fritas",
        ingredientes: "Papas, sal",
        price: 80,
        categoria: "Entradas"
      },
      {
        id: "burger-4",
        name: "Refresco",
        ingredientes: "Bebida gaseosa a elección",
        price: 50,
        categoria: "Bebidas"
      },
      {
        id: "burger-5",
        name: "Nuggets de Pollo",
        ingredientes: "Pechuga de pollo empanizada",
        price: 120,
        categoria: "Kids"
      },
      {
        id: "burger-6",
        name: "Sopa de Pollo",
        ingredientes: "Pollo, fideos, zanahoria, apio, cebolla",
        price: 90,
        categoria: "Sopas"
      },
      {
        id: "burger-7",
        name: "Brownie con Helado",
        ingredientes: "Brownie de chocolate, helado de vainilla, sirope de chocolate",
        price: 100,
        categoria: "Postres"
      },
      {
        id: "burger-8",
        name: "Ensalada César",
        ingredientes: "Lechuga, pollo a la plancha, crutones, queso parmesano, aderezo César",
        price: 130,
        categoria: "Entradas"
      },
      {
        id: "burger-9",
        name: "Mini Hamburguesa Kids",
        ingredientes: "Mini hamburguesa de res, pan, queso cheddar",
        price: 90,
        categoria: "Kids"
      }
    ]
  },
  {
    id: "kfc",
    name: "KFC",
    image: "https://1000marcas.net/wp-content/uploads/2020/01/KFC-logo.png",
    tipos: ["Pollo"],
    perfilImage: "/img/pollo-frito.jpg",
    direccion: "Av. Churchill, Santo Domingo.",
    phone: "866 111 3333",
    horario: [
      {
        dia: "Lunes a Viernes",
        apertura: "11:00",
        cierre: "23:00"
      },
      {
        dia: "Sábado",
        apertura: "12:00",
        cierre: "23:00"
      },
      {
        dia: "Domingo",
        apertura: "12:00",
        cierre: "21:00"
      }
    ],
    amnidades: [ 
      {svg:"area-exterior.svg", name:"Area Exterior"}, 
      {svg:"wifi.svg", name:"Wifi"}
    ],
    menu: [
      {
        id: "kfc-1",
        name: "Combo 2 Piezas de Pollo",
        ingredientes: "2 piezas de pollo, papas fritas, refresco",
        price: 220,
        categoria: "Plato Fuerte"
      },
      {
        id: "kfc-2",
        name: "Tenders",
        ingredientes: "Tiras de pechuga de pollo empanizadas",
        price: 150,
        categoria: "Entradas"
      },
      {
        id: "kfc-3",
        name: "Papas Fritas",
        ingredientes: "Papas, sal",
        price: 80,
        categoria: "Entradas"
      },
      {
        id: "kfc-4",
        name: "Refresco",
        ingredientes: "Bebida gaseosa a elección",
        price: 50,
        categoria: "Bebidas"
      },
      {
        id: "kfc-5",
        name: "Helado Sundae",
        ingredientes: "Helado de vainilla, sirope de chocolate",
        price: 70,
        categoria: "Postres"
      },
      {
        id: "kfc-6",
        name: "Sopa de Pollo Picante",
        ingredientes: "Pollo, vegetales, especias picantes",
        price: 95,
        categoria: "Sopas"
      },
      {
        id: "kfc-7",
        name: "Combo Kids",
        ingredientes: "1 pieza de pollo, papas fritas, jugo",
        price: 110,
        categoria: "Kids"
      },
      {
        id: "kfc-8",
        name: "Ensalada de Repollo",
        ingredientes: "Repollo, zanahoria, aderezo especial",
        price: 60,
        categoria: "Entradas"
      },
      {
        id: "kfc-9",
        name: "Pie de Manzana",
        ingredientes: "Masa crujiente, relleno de manzana",
        price: 75,
        categoria: "Postres"
      }
    ]
  }
];