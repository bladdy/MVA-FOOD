import { useState, type JSX } from "react";
import type { Menu, Categorias } from "@/Types/Restaurante";

import FoodIcon from "@/components/Icons/FoodIcon";
import { categoriaOrden as baseCategorias } from "@/consts/categorias";
import CategoriaButton from "./Buttons/CategoriaButton";
import EntradasIcon from "@/components/Icons/EntradasIcon";
import PostresIcon from "@/components/Icons/PostresIcon";
import BebidasIcon from "@/components/Icons/BebidasIcon";
import KidsIcon from "@/components/Icons/KidsIcon";
import SopasIcon from "@/components/Icons/SopasIcon";
import BurgersIcon from "@/components/Icons/BurgersIcon";
import AllCategoryIcon from "@/components/Icons/AllCategoryIcon";
import PastasIcon from "@/components/Icons/PastasIcon";
import SteakHouseIcon from "@/components/Icons/SteakHouseIcon";
import FriesChickenIcon from "@/components/Icons/FriesChickenIcon";

interface Props {
  titulo: string;
  menu: Menu[];
}

const categoriaIcons: Record<Categorias, JSX.Element> = {
  Todas: <AllCategoryIcon className="w-6 h-6" />,
  Entradas: <EntradasIcon className="w-6 h-6" />,
  "Plato Fuerte": <FoodIcon className="w-6 h-6" />,
  "Burger & Street Food": <BurgersIcon className="w-6 h-6" />,
  "Steak House": <SteakHouseIcon className="w-6 h-6" />,
  "Pollo Frito": <FriesChickenIcon className="w-6 h-6" />,
  Sopas: <SopasIcon className="w-6 h-6" />,
  Kids: <KidsIcon className="w-6 h-6" />,
  Bebidas: <BebidasIcon className="w-6 h-6" />,
  Postres: <PostresIcon className="w-6 h-6" />,
  Pastas:  <PastasIcon className="w-6 h-6" />,
};

export default function MenuSection({ menu, titulo }: Props) {
  const [selectedCategoria, setSelectedCategoria] =
    useState<Categorias>("Todas");

  const groupedMenu = menu.reduce(
    (acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = [];
      }
      acc[item.categoria].push(item);
      return acc;
    },
    {} as Record<Categorias, Menu[]>
  );

  const categoriasDisponibles = [
    "Todas",
    ...baseCategorias.filter((cat) => groupedMenu[cat]?.length > 0),
  ] as Categorias[];

  return (
    <div>
      <h2 className="text-4xl font-bold text-orange-600 mb-6">{titulo}</h2>

      {/* Botones de Categoría */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {categoriasDisponibles.map((categoria) => (
          <CategoriaButton
            key={categoria}
            label={categoria}
            icon={categoriaIcons[categoria]}
            active={selectedCategoria === categoria}
            onClick={() => setSelectedCategoria(categoria)}
          />
        ))}
      </div>

      {/* Contenido del Menú */}
      <div
        className="mb-10 transition-all duration-1000 ease-in-out"
        key={selectedCategoria}
      >
        {selectedCategoria === "Todas" ? (
          baseCategorias
            .filter((cat) => groupedMenu[cat]?.length)
            .map((categoria) => (
              <div key={categoria} className="mb-8 animate-fade-in">
                <div className="flex items-center justify-between border-b border-orange-200 pb-1 mb-2">
                  <div className="flex items-center gap-2 text-xl font-semibold text-orange-700">
                    {categoriaIcons[categoria]}
                    {categoria}
                  </div>
                  <div className="text-sm font-semibold text-orange-600">
                    Precios
                  </div>
                </div>
                <table className="w-full text-sm text-left">
                  <tbody>
                    {groupedMenu[categoria]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-b-0 hover:bg-orange-50 transition-colors"
                        >
                          <td className="py-3 px-2 w-3/5">
                            <div className="text-base font-semibold text-orange-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-orange-600">
                              {item.ingredientes}
                            </div>
                          </td>
                          <td className="py-3 px-2 w-1/5 text-right font-semibold text-orange-800 whitespace-nowrap">
                            ${item.price.toLocaleString("es-MX")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))
        ) : (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between border-b border-orange-200 pb-1 mb-2">
              <div className="flex items-center gap-2 text-xl font-semibold text-orange-700">
                {categoriaIcons[selectedCategoria]}
                {selectedCategoria}
              </div>
              <div className="text-sm font-semibold text-orange-600">
                Precios
              </div>
            </div>
            <table className="w-full text-sm text-left">
              <tbody>
                {(groupedMenu[selectedCategoria] ?? [])
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-orange-50 transition-colors"
                    >
                      <td className="py-3 px-2 w-3/5">
                        <div className="text-base font-semibold text-orange-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-orange-600">
                          {item.ingredientes}
                        </div>
                      </td>
                      <td className="py-3 px-2 w-1/5 text-right font-semibold text-orange-800 whitespace-nowrap">
                        ${item.price.toLocaleString("es-MX")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
