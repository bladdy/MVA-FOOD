import type { Variante } from "@/Types/Restaurante";

export const variantesPorCategoria: Record<string, Variante[]> = {
  "Burger & Street Food": [
    {
      id: "tipo-pan",
      name: "Tipo de pan",
      obligatorio: true,
      maxSeleccion: 1,
      opciones: [
        { nombre: "Brioche clásico" },
        { nombre: "Integral saludable" },
        { nombre: "Sin gluten", precio: 5 },
      ],
    },
    {
      id: "quitar",
      name: "Sin estos ingredientes",
      obligatorio: false,
      maxSeleccion: 4,
      opciones: [
        { nombre: "Lechuga" },
        { nombre: "Tomate" },
        { nombre: "Queso cheddar" },
        { nombre: "Salsa especial" },
      ],
    },
    {
      id: "adicionales",
      name: "Extras deliciosos",
      obligatorio: false,
      maxSeleccion: 4,
      opciones: [
        { nombre: "Tocino ahumado", precio: 10 },
        { nombre: "Huevo frito", precio: 8 },
        { nombre: "Jalapeños picantes", precio: 5 },
        { nombre: "Champiñones salteados", precio: 6 },
      ],
    },
    {
      id: "acompañamientos",
      name: "Acompañamientos",
      obligatorio: false,
      maxSeleccion: 2,
      opciones: [
        { nombre: "Papas fritas", precio: 15 },
        { nombre: "Aros de cebolla", precio: 18 },
        { nombre: "Dedos de queso", precio: 20 },
        { nombre: "Ensalada mixta", precio: 12 },
      ],
    },
    {
      id: "bebida",
      name: "Elige tu bebida",
      obligatorio: true,
      maxSeleccion: 1,
      opciones: [
        { nombre: "Refresco 200ml" },
        { nombre: "Refresco 500ml", precio: 5 },
        { nombre: "Agua natural" },
        { nombre: "Té helado", precio: 6 },
      ],
    },
  ],
  "Bebidas": [
    {
      id: "tipo-refresco",
      name: "Tipo de refresco",
      obligatorio: true,
      maxSeleccion: 1,
      opciones: [
        { nombre: "Cola" },
        { nombre: "Naranja" },
        { nombre: "Limón" },
      ],
    },
  ],
  "Steak House": [
    {
      id: "punto-carne",
      name: "Término de cocción",
      obligatorio: true,
      maxSeleccion: 1,
      opciones: [
        { nombre: "Rojo (3/4)" },
        { nombre: "Término medio" },
        { nombre: "Bien cocido" },
      ],
    },
    {
      id: "guarnicion",
      name: "Guarnición",
      obligatorio: false,
      maxSeleccion: 1,
      opciones: [
        { nombre: "Puré de papas" },
        { nombre: "Verduras al vapor" },
        { nombre: "Papas a la francesa" },
      ],
    },
    {
      id: "bebida",
      name: "Bebida para acompañar",
      obligatorio: true,
      maxSeleccion: 1,
      opciones: [
        { nombre: "Vino tinto", precio: 25 },
        { nombre: "Vino blanco", precio: 25 },
        { nombre: "Refresco" },
        { nombre: "Agua mineral" },
      ],
    },
    {
      id: "salsas",
      name: "Salsas opcionales",
      obligatorio: false,
      maxSeleccion: 2,
      opciones: [
        { nombre: "Chimichurri" },
        { nombre: "Salsa BBQ" },
        { nombre: "Pimienta negra" },
        { nombre: "Sin salsa" },
      ],
    },
  ],
};
