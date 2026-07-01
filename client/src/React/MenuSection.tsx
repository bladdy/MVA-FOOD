import { useState, type JSX } from "react";
import type { Menu, Categorias, ComboResponse, TipoEntregaResponse, MetodoPagoResponse } from "@/Types/Restaurante.ts";

import { usePedido } from "@/React/hooks/usePedido.ts";
import ModalProducto from "@/React/Modales/ModalProducto.tsx";
import ModalPedido from "@/React/Modales/ModalPedido.tsx";
import ModalCombo from "@/React/Modales/ModalCombo.tsx";
import BotonVerPedido from "@/React/Buttons/BotonVerPedido.tsx";
import { pedidoService } from "@/Services/pedidoService.ts";
import { showAlert } from "@/lib/alert.ts";

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
import CrossIcon from "@/components/Icons/CrossIcon.tsx";
import TipoEntregaSelector from "./TipoEntregaSelector.tsx";

interface Props {
  restaurantId: string;
  titulo: string;
  menu: Menu[];
  combos?: ComboResponse[];
  tiposEntrega?: TipoEntregaResponse[];
  metodosPago?: MetodoPagoResponse[];
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

const staggerClass = (i: number) => `stagger-${Math.min(i + 1, 8)}`;

export default function MenuSection({ restaurantId, menu, combos, titulo, tiposEntrega, metodosPago, mesa }: Props) {

  const {
    pedido,
    total,
    cantidad,
    modalProducto,
    setModalProducto,
    agregarProducto,
    agregarCombo,
    modalPedidoAbierto,
    setModalPedidoAbierto,
    setPedido,
  } = usePedido();
  const tiposActivos = tiposEntrega?.filter((t) => t.activo) ?? [];
  const [tipoEntregaId, setTipoEntregaId] = useState<string | null>(
    tiposActivos.length > 0 ? tiposActivos[0].id : null
  );
  const tipoEntregaSel = tiposActivos.find((t) => t.id === tipoEntregaId);
  const metodosActivos = metodosPago?.filter((m) => m.activo) ?? [];
  const [metodoPagoId, setMetodoPagoId] = useState<string | null>(
    metodosActivos.length > 0 ? metodosActivos[0].id : null
  );
  const metodoPagoSel = metodosActivos.find((m) => m.id === metodoPagoId);

  const calcularCostoEnvio = (): number => {
    if (!tipoEntregaSel) return 0;
    if (tipoEntregaSel.costoFijo != null) return tipoEntregaSel.costoFijo;
    if (tipoEntregaSel.porcentaje != null) return total * (tipoEntregaSel.porcentaje / 100);
    return 0;
  };

  const costoEnvio = calcularCostoEnvio();
  const totalConEnvio = total + costoEnvio;
  const [selectedCategoria, setSelectedCategoria] = useState<Categorias>("Todas");
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [modalCombo, setModalCombo] = useState<ComboResponse | null>(null);
  const groupedMenu = menu.reduce(
    (acc, item) => {
      const categoriaKey = (item.categoria?.nombre || "Sin categoría") as Categorias;
      if (!acc[categoriaKey]) acc[categoriaKey] = [];
      acc[categoriaKey].push(item);
      return acc;
    },
    {} as Record<Categorias, Menu[]>
  );

  const categoriasDisponibles = [
    "Todas",
    ...baseCategorias.filter((cat) => groupedMenu[cat as Categorias]?.length > 0),
  ] as Categorias[];


  const [enviando, setEnviando] = useState(false);

  const handleSubmitPedido = async (nombre: string, telefono: string, direccion?: string) => {
    if (!menu.length) return;
    setEnviando(true);
    try {
      await pedidoService.create({
        clienteNombre: nombre,
        clienteTelefono: telefono,
        tipoEntrega: tipoEntregaSel?.nombre ?? "recoger",
        metodoPago: metodoPagoSel?.nombre,
        direccion: tipoEntregaSel?.nombre === "A domicilio" ? direccion : undefined,
        restauranteId: restaurantId,
        items: pedido.map((i) => ({
          menuId: i.esCombo ? undefined : i.producto?.id,
          cantidad: i.cantidad,
          precio: i.precio,
          notas: i.notas || "",
          opciones: i.opciones || "",
          esCombo: i.esCombo || false,
          comboId: i.comboId,
          comboNombre: i.comboNombre,
          comboItemsJson: i.comboItemsJson,
        })),
      });
      setPedido([]);
      setModalPedidoAbierto(false);
      showAlert("¡Pedido enviado con éxito!", "success");
    } catch (err) {
      console.error(err);
      showAlert("Error al enviar el pedido", "error");
    } finally {
      setEnviando(false);
    }
  };

  const handleCantidadChange = (index: number, nuevaCantidad: number) => {
    const nuevoPedido = [...pedido];
    if (nuevaCantidad <= 0) {
      nuevoPedido.splice(index, 1);
    } else {
      nuevoPedido[index].cantidad = nuevaCantidad;
    }
    setPedido(nuevoPedido);
  };

  const combosPredefinidos = combos?.filter((c) => c.predefinido && c.activo) ?? [];

  return (
    <div className="relative">
      <h2 className="font-display text-2xl md:text-4xl font-bold text-orange-600 mb-8 text-center">
        {titulo}
      </h2>

      {tiposActivos.length > 0 && combosPredefinidos.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-bold text-orange-600 mb-4">Combos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {combosPredefinidos.map((combo) => (
              <div key={combo.id} className="bg-white border border-orange-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-orange-800">{combo.nombre}</h4>
                    {combo.descripcion && (
                      <p className="text-xs text-warm-400 mt-0.5">{combo.descripcion}</p>
                    )}
                  </div>
                  <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Combo
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {combo.items.map((i) => `${i.cantidad}x ${i.menuNombre}`).join(", ")}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-700">
                    {combo.precio ? `$${combo.precio.toFixed(2)}` : ""}
                  </span>
                  <button
                    onClick={() => setModalCombo(combo)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-1.5 rounded-xl font-medium transition-colors"
                  >
                    Personalizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones de Categoría */}
      <div className="flex overflow-x-auto gap-3 pb-2 mb-8 scrollbar-none justify-start md:justify-center">
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
      {tiposActivos.length > 0 && (
        <TipoEntregaSelector
          tipos={tiposEntrega ?? []}
          selectedId={tipoEntregaId}
          onChange={setTipoEntregaId}
          subtotal={total}
        />
      )}

      {/* Contenido del Menú */}
      <div className="mb-10" key={selectedCategoria}>
        {(selectedCategoria === "Todas"
          ? baseCategorias.filter((cat) => groupedMenu[cat as Categorias]?.length)
          : [selectedCategoria]
        ).map((categoria) => (
          <div key={categoria} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                {categoriaIcons[categoria as keyof typeof categoriaIcons]}
                <h3 className="font-display text-xl md:text-2xl font-bold text-gray-800">{categoria}</h3>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
            </div>

            <div className="space-y-3">
              {(groupedMenu[categoria as Categorias] ?? [])
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover transition-all duration-200 animate-slide-up ${staggerClass(idx)}`}
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={item.imagen || "/mva-logo-rb.png"}
                        alt={item.nombre}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() =>
                          setImagenSeleccionada(
                            item.imagen ? item.imagen : "/mva-logo-rb.png"
                          )
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base md:text-lg font-semibold text-gray-800 capitalize leading-tight">
                        {item.nombre}
                      </div>
                      <div className="text-sm text-warm-400 capitalize mt-0.5 line-clamp-2">
                        {item.ingredientes}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-bold text-orange-600 text-base md:text-lg whitespace-nowrap">
                        ${item.precio.toLocaleString("es-MX")}
                      </span>
                      {(tiposActivos.length > 0 || mesa) && (
                        <button
                          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-colors shadow-sm"
                          onClick={() => setModalProducto(item)}
                        >
                          <AddIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </div>
        ))}

        {/* Modal de imagen */}
        {imagenSeleccionada && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4 animate-fade-in">
            <div className="relative flex items-center justify-center">
              <button
                className="absolute top-2 right-2 text-white bg-orange-500 hover:bg-orange-600 p-2 rounded-full transition-colors"
                onClick={() => setImagenSeleccionada(null)}
              >
                <CrossIcon className="w-5 h-5" />
              </button>
              <img
                src={imagenSeleccionada}
                alt="Imagen del producto"
                className="h-auto w-[800px] rounded-lg shadow-lg object-fill"
              />
            </div>
          </div>
        )}

        {/* Modal de combo */}
        {modalCombo && (
          <ModalCombo
            combo={modalCombo}
            onClose={() => setModalCombo(null)}
            onAgregar={(comboId, comboNombre, itemsJson) => {
              agregarCombo(comboId, comboNombre, itemsJson);
              setModalCombo(null);
            }}
          />
        )}

        {/* Modales de pedido */}
        {modalProducto && (
          <ModalProducto
            producto={modalProducto}
            combosSugeridos={combos?.filter((c) => !c.predefinido && c.activo && c.sugerencias?.some((s) => s.menuId === modalProducto.id))?.flatMap((c) => c.sugerencias?.filter((s) => s.menuId === modalProducto.id) ?? [])}
            onClose={() => setModalProducto(null)}
            onAgregar={(notas, opciones) => agregarProducto(modalProducto, notas, opciones)}
            onAgregarCombo={(comboId, comboNombre, itemsJson) => agregarCombo(comboId, comboNombre, itemsJson)}
          />
        )}
        {modalPedidoAbierto && (
          <ModalPedido
            mesa={mesa}
            pedido={pedido}
            total={totalConEnvio}
            costoEnvio={costoEnvio}
            tipoEntrega={tipoEntregaSel?.nombre}
            metodosPago={metodosPago}
            metodoPagoId={metodoPagoId}
            onMetodoPagoChange={setMetodoPagoId}
            onClose={() => setModalPedidoAbierto(false)}
            onCantidadChange={handleCantidadChange}
            onSubmit={handleSubmitPedido}
          />
        )}

        {/* Botón flotante de ver pedido */}
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
