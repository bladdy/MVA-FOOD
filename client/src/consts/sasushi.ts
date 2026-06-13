// src/data/restaurants/sasushi.ts

export const sasushiRestaurant = {
  id: "sasushi",
  name: "SASUSHI",
  slogan: "Sabor que enamora",
  logo: "/images/restaurants/mr_menu.png",
  cover: "/images/restaurants/mr_menu.png",

  colors: {
    primary: "#8BAA2A",
    secondary: "#FFFFFF",
    background: "#050505",
    border: "#556B1E",
  },
  combos: 
    {
      id: "combos",
      name: "Combos Sasushi",
      image: "/images/restaurants/mr_menus_no.png",

      items: [
        {
          id: "combo-basico",
          name: "Combo Básico",
          nameProduct: "Classic Chicken",
          person: "ideal para 1 persona",
          availableTypes: ["1 Roll clásico de pollo","1 Roll frito de pollo"],
          price: 750,
          image: "/images/restaurants/mr_menus_no.png",
        },
        {
          id: "combo-intermedio",
          name: "Combo Intermedio",
          person: "perfecto para compartir",
          nameProduct: "Tempura Mix",
          availableTypes:  [
            "1 Roll pollo tempura", " 1 Roll salmón tempura",],
          price: 800,
          image: "/images/restaurants/mr_menus_no.png",
        },
        {
          id: "combo-premium",
          name: "Combo Premium",
          person: "experiencia sasushi",
          nameProduct: "Sasushi Deluxe",
          availableTypes: [
            "2 Rolls de salmón"," 1 Roll de camarones"],
          price: 1299,
          image: "/images/restaurants/mr_menus_no.png",
        },
      ],
    }

  ,

  categories: [
    {
      id: "clasicos",
      name: "Rolls Clásicos",
      image: "/images/restaurants/mr_menus_no.png",

      items: [
        {
          id: "roll-pollo",
          name: "Roll de Pollo",
          description:
            "Pollo • Aguacate • Queso crema • Puerro",
          price: 419,
          availableTypes: ["Clásico", "Frito"],
          image: "/images/restaurants/mr_menus_no.png",
        },
        {
          id: "roll-salmon",
          name: "Roll de Salmón",
          description:
            "Salmón • Puerro • Queso crema • Ají morrón",
          price: 475,
          availableTypes: ["Clásico", "Frito"],
          image: "/images/restaurants/mr_menus_no.png",
        },
        {
          id: "roll-camaron",
          name: "Roll de Camarón",
          description:
            "Camarón • Plátano maduro • Queso crema • Puerro",
          price: 500,
          availableTypes: ["Clásico", "Frito"],
          image: "/images/restaurants/mr_menus_no.png",
        },
      ],
    },

    {
      id: "vegetarianos",
      name: "Vegetariano",
      image: "/images/restaurants/mr_menus_no.png",

      items: [
        {
          id: "avocado-lover",
          name: "Avocado Lover Roll",
          description:
            "Aguacate • Ají morrón • Ajonjolí tostado",
          price: 350,
          availableTypes: ["Clásico", "Frito"],
          image: "/images/restaurants/mr_menus_no.png",
        },
        {
          id: "sweet-plantain",
          name: "Sweet Plantain Roll",
          description:
            "Plátano maduro • Aguacate • Ajonjolí",
          price: 375,
          availableTypes: ["Clásico", "Frito"],
          image: "/images/restaurants/mr_menus_no.png",
        },
        {
          id: "tofu-teriyaki",
          name: "Tofu Teriyaki Roll",
          description:
            "Tofu marinado • Aguacate • Salsa teriyaki vegana",
          price: 400,
          availableTypes: ["Clásico", "Frito"],
          image: "/images/restaurants/mr_menus_no.png",
        },
        {
          id: "mushroom-crunch",
          name: "Mushroom Crunch Roll",
          description:
            "Hongos salteados • Aguacate • Puerro",
          price: 435,
          availableTypes: ["Clásico", "Frito"],
          image: "/images/restaurants/mr_menus_no.png",
        },
      ],
    }
  ],
};