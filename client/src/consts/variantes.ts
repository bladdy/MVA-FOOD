import type { Variante } from "@/Types/Restaurante.ts";

export const variantesPorCategoria: Record<string, Variante[]> = {
  "Burger & Street Food": [
    {
      id: "tipo-pan",
      name: "Tipo de pan",
      obligatorio: true,
      maxSeleccion: 1,
      opciones: [
        { nombre: "Brioche clásico", precio: 5 },
        { nombre: "Integral saludable", precio: 4 },
        { nombre: "Sin gluten", precio: 5 },
      ],
    },
    {
      id: "quitar",
      name: "Sin estos ingredientes",
      obligatorio: false,
      maxSeleccion: 4,
      opciones: [
        { nombre: "Lechuga", precio: 0 },
        { nombre: "Tomate", precio: 0 },
        { nombre: "Queso cheddar", precio: 0 },
        { nombre: "Salsa especial", precio: 0 },
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
        { nombre: "Refresco 200ml", precio: 3 },
        { nombre: "Refresco 500ml", precio: 5 },
        { nombre: "Agua natural", precio: 2 },
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
        { nombre: "Cola", precio: 0 },
        { nombre: "Naranja", precio: 0 },
        { nombre: "Limón", precio: 0 },
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
        { nombre: "Rojo (3/4)", precio: 0 },
        { nombre: "Término medio", precio: 0 },
        { nombre: "Bien cocido", precio: 0 },
      ],
    },
    {
      id: "guarnicion",
      name: "Guarnición",
      obligatorio: false,
      maxSeleccion: 1,
      opciones: [
        { nombre: "Puré de papas", precio: 0 },
        { nombre: "Verduras al vapor", precio: 0 },
        { nombre: "Papas a la francesa", precio: 0 },
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
        { nombre: "Refresco", precio: 5 },
        { nombre: "Agua mineral", precio: 2 },
      ],
    },
    {
      id: "salsas",
      name: "Salsas opcionales",
      obligatorio: false,
      maxSeleccion: 2,
      opciones: [
        { nombre: "Chimichurri", precio: 0 },
        { nombre: "Salsa BBQ", precio: 0 },
        { nombre: "Pimienta negra", precio: 0 },
        { nombre: "Sin salsa", precio: 0 },
      ],
    },
  ],
};
