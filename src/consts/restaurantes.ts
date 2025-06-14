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
        dia: "Lunes",
        apertura: "11:00",
        cierre: "22:00"
      },
      {
        dia: "Martes",
        apertura: "11:00",
        cierre: "22:00"
      },
      {
        dia: "Miércoles",
        apertura: "11:00",
        cierre: "22:00"
      },
      {
        dia: "Jueves",
        apertura: "11:00",
        cierre: "22:00"
      },
      {
        dia: "Viernes",
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
    amnidades: ""
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
        dia: "Lunes",
        apertura: "11:00",
        cierre: "22:00"
      },
      {
        dia: "Martes",
        apertura: "11:00",
        cierre: "22:00"
      },
      {
        dia: "Miércoles",
        apertura: "11:00",
        cierre: "22:00"
      },
      {
        dia: "Jueves",
        apertura: "11:00",
        cierre: "22:00"
      },
      {
        dia: "Viernes",
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
    amnidades: ""
  },
  // Resto igual, pero añade perfilImage, tipos y direccion a cada uno si lo vas a usar.
];