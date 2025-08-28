import { useState, type JSX } from "react";
import type { Menu, Categorias } from "@/Types/Restaurante.ts";

import { usePedido } from "@/React/hooks/usePedido.ts";
import ModalProducto from "@/React/Modales/ModalProducto.tsx";
import ModalPedido from "@/React/Modales/ModalPedido.tsx";
import BotonVerPedido from "@/React/Buttons/BotonVerPedido.tsx";

import FoodIcon from "@/components/Icons/FoodIcon.tsx";
import { categoriaOrden as baseCategorias } from "@/consts/categorias.ts";
import CategoriaButton from "./Buttons/CategoriaButton.tsx";
import EntradasIcon from "@/components/Icons/EntradasIcon.tsx";
import PostresIcon from "@/components/Icons/PostresIcon.tsx";
import BebidasIcon from "@/components/Icons/BebidasIcon.tsx";
import KidsIcon from "@/components/Icons/KidsIcon.tsx";
import SopasIcon from "@/components/Icons/SopasIcon.tsx";
import BurgersIcon from "@/components/Icons/BurgersIcon.tsx";
import AllCategoryIcon from "@/components/Icons/AllCategoryIcon.tsx";
import PastasIcon from "@/components/Icons/PastasIcon.tsx";
import SteakHouseIcon from "@/components/Icons/SteakHouseIcon.tsx";
import FriesChickenIcon from "@/components/Icons/FriesChickenIcon.tsx";
import AddIcon from "@/components/Icons/AddIcon.tsx";
import CrossIcon from "@/components/Icons/CrossIcon.tsx"; // Para cerrar la galería
import TipoEntregaSelector from "./TipoEntregaSelector.tsx";

interface Props {
  titulo: string;
  menu: Menu[];
  tomaPedido?: boolean;
  mesa?: string | null;
}

const categoriaIcons: Record<Categorias, JSX.Element> = {
  Todas: <AllCategoryIcon className="w-6 h-6" />,
  Pizza: <FoodIcon className="w-6 h-6" />,
  Ensaladas: <FoodIcon className="w-6 h-6" />,
  Mariscos: <FoodIcon className="w-6 h-6" />,
  Pescados: <FoodIcon className="w-6 h-6" />,
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

export default function MenuSection({ menu, titulo, tomaPedido, mesa }: Props) {
  const {
    pedido,
    total,
    cantidad,
    modalProducto,
    setModalProducto,
    agregarProducto,
    modalPedidoAbierto,
    setModalPedidoAbierto,
    setPedido,
  } = usePedido();
  const [tipoEntrega, setTipoEntrega] = useState<"domicilio" | "recoger">(
    "domicilio"
  );
  const [selectedCategoria, setSelectedCategoria] =
    useState<Categorias>("Todas");
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(
    null
  ); // ⭐️ Galería

  const groupedMenu = menu.reduce(
    (acc, item) => {
      if (!acc[item.categoria]) acc[item.categoria] = [];
      acc[item.categoria].push(item);
      return acc;
    },
    {} as Record<Categorias, Menu[]>
  );

  const categoriasDisponibles = [
    "Todas",
    ...baseCategorias.filter((cat) => groupedMenu[cat as Categorias]?.length > 0),
  ] as Categorias[];

  const handleCantidadChange = (index: number, nuevaCantidad: number) => {
    const nuevoPedido = [...pedido];
    if (nuevaCantidad <= 0) {
      nuevoPedido.splice(index, 1);
    } else {
      nuevoPedido[index].cantidad = nuevaCantidad;
    }
    setPedido(nuevoPedido);
  };

  return (
    <div className="relative">
      <h2 className="text-xl md:text-4xl font-bold text-orange-600 mb-6">
        {titulo}
      </h2>

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
      {/* Take out o delivery */}
      {tomaPedido && (
        <TipoEntregaSelector
          tipoEntrega={tipoEntrega}
          setTipoEntrega={setTipoEntrega}
        />
      )}

      {/* Contenido del Menú */}
      <div
        className="mb-10 transition-all duration-1000 ease-in-out"
        key={selectedCategoria}
      >
        {(selectedCategoria === "Todas"
          ? baseCategorias.filter((cat) => groupedMenu[cat as Categorias]?.length)
          : [selectedCategoria]
        ).map((categoria) => (
          <div key={categoria} className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-orange-200 pb-1 mb-2">
              <div className="flex items-center gap-2 text-xl font-semibold text-orange-700">
                {categoriaIcons[categoria as keyof typeof categoriaIcons]}
                {categoria}
              </div>
              <div className="text-sm font-semibold text-orange-600">
                Precios
              </div>
            </div>
            <table className="w-full text-sm text-left">
              <tbody>
                {(groupedMenu[categoria as Categorias] ?? [])
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-orange-50 transition-colors"
                    >
                      <td className="w-1/6">
                        <img
                          src={item.imagen || "/mva-logo-rb.png"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-90 transition"
                          onClick={() =>
                            setImagenSeleccionada(
                              item.imagen || "/mva-logo-rb.png"
                            )
                          }
                        />
                      </td>
                      <td className="py-3 px-0 w-4/6">
                        <div className="text-base font-semibold text-orange-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-orange-600">
                          {item.ingredientes}
                        </div>
                      </td>
                      <td className="py-3 px-2 w-1/6 text-right font-semibold text-orange-800 whitespace-nowrap">
                        <div>${item.price.toLocaleString("es-MX")}</div>
                        {(tomaPedido || mesa) && (
                          <button
                            className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded-full mt-1"
                            onClick={() => setModalProducto(item)}
                          >
                            <AddIcon className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Galería Modal */}
        {imagenSeleccionada && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              <button
                className="absolute top-2 right-2 text-white bg-orange-500 hover:bg-orange-600 p-2 rounded-full"
                onClick={() => setImagenSeleccionada(null)}
              >
                <CrossIcon className="w-5 h-5" />
              </button>
              <img
                src={imagenSeleccionada}
                alt="Imagen del producto"
                className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}

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
            mesa={mesa}
            pedido={pedido}
            total={
              tipoEntrega === "domicilio" && total < 200 ? total + 20 : total
            }
            envioGratis={tipoEntrega === "domicilio"}
            onClose={() => setModalPedidoAbierto(false)}
            onCantidadChange={handleCantidadChange}
          />
        )}

        {/* Botón flotante */}
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
