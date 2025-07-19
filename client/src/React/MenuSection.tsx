// MenuSection.tsx
import { useState, type JSX } from "react";
import type { Menu, Categorias } from "@/Types/Restaurante";

import { usePedido } from "@/React/hooks/usePedido";
import ModalProducto from "@/React/Modales/ModalProducto";
import ModalPedido from "@/React/Modales/ModalPedido";
import BotonVerPedido from "@/React/Buttons/BotonVerPedido";

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
import AddIcon from "@/components/Icons/AddIcon";

interface Props {
  titulo: string;
  menu: Menu[];
  tomaPedido?: boolean; // Si se usa en un contexto donde no se toma pedido, como el menú de inicio
  // Si no se toma pedido, no se mostrarán los botones de agregar al pedido ni el modal de pedido
  // Si se toma pedido, se mostrarán los botones y el modal de pedido
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
  Pastas: <PastasIcon className="w-6 h-6" />,
};

export default function MenuSection({ menu, titulo, tomaPedido }: Props) {
  const {
    pedido,
    total,
    cantidad,
    modalProducto,
    setModalProducto,
    agregarProducto,
    modalPedidoAbierto,
    setModalPedidoAbierto,
    setPedido, // necesario para actualizar cantidades
  } = usePedido();

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

  // ✅ Función para cambiar cantidad
  const handleCantidadChange = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      const nuevoPedido = [...pedido];
      nuevoPedido.splice(index, 1);
      setPedido(nuevoPedido);
    } else {
      const nuevoPedido = [...pedido];
      nuevoPedido[index].cantidad = nuevaCantidad;
      setPedido(nuevoPedido);
    }
  };

  return (
    <div className="relative">
      <h2 className="text-xl md:text-4xl font-bold text-orange-600 mb-6">{titulo}</h2>

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
        {(selectedCategoria === "Todas"
          ? baseCategorias.filter((cat) => groupedMenu[cat]?.length)
          : [selectedCategoria]
        ).map((categoria) => (
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
                {(groupedMenu[categoria] ?? [])
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
                        <div>${item.price.toLocaleString("es-MX")}</div>
                        {tomaPedido && (
                          <div>
                            <button
                              className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded-full"
                              onClick={() => setModalProducto(item)}
                            >
                              <AddIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Modales */}
        {modalProducto && (
          <ModalProducto
            producto={modalProducto}
            onClose={() => setModalProducto(null)}
            onAgregar={(notas) => agregarProducto(modalProducto, notas)}
          />
        )}

        {modalPedidoAbierto && (
          <ModalPedido
            pedido={pedido}
            total={total}
            onClose={() => setModalPedidoAbierto(false)}
            onCantidadChange={handleCantidadChange} // ✅ Aquí se pasa
          />
        )}

        {/* Botón flotante Ver pedido */}
        {cantidad > 0 && (
          <BotonVerPedido
            total={total}
            cantidad={cantidad}
            onClick={() => setModalPedidoAbierto(true)}
          />
        )}
      </div>
    </div>
  );
}
