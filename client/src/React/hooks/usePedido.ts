import { useState, useMemo } from "react";
import type { Menu, PedidoItem } from "@/Types/Restaurante.ts";

interface UsePedidoHook {
  pedido: PedidoItem[];
  setPedido: React.Dispatch<React.SetStateAction<PedidoItem[]>>;
  total: number;
  cantidad: number;
  modalProducto: Menu | null;
  setModalProducto: React.Dispatch<React.SetStateAction<Menu | null>>;
  agregarProducto: (producto: Menu, notas?: string, opciones?: string) => void;
  agregarCombo: (comboId: string, comboNombre: string, comboItemsJson: string) => void;
  modalPedidoAbierto: boolean;
  setModalPedidoAbierto: React.Dispatch<React.SetStateAction<boolean>>;
}

function calcularPrecioItem(item: PedidoItem): number {
  if (item.esCombo) {
    const itemsInternos: { precio: number; cantidad: number }[] = JSON.parse(item.comboItemsJson || "[]");
    return itemsInternos.reduce((sum, si) => sum + si.precio * si.cantidad, 0);
  }
  if (!item.producto) return 0;
  const opcionesArr: string[] = JSON.parse(item.opciones || "[]");
  let extra = 0;
  if (item.producto.variantes) {
    item.producto.variantes.forEach((grupo) => {
      opcionesArr.forEach((nombre) => {
        const op = grupo.opciones.find((o) => o.nombre === nombre);
        if (op?.precio) extra += op.precio;
      });
    });
  }
  return (item.producto.precio + extra) * item.cantidad;
}

export function usePedido(): UsePedidoHook {
  const [pedido, setPedido] = useState<PedidoItem[]>([]);
  const [modalProducto, setModalProducto] = useState<Menu | null>(null);
  const [modalPedidoAbierto, setModalPedidoAbierto] = useState(false);

  function agregarProducto(producto: Menu, notas = "", opciones = "[]") {
    setPedido((prev) => [...prev, { producto, cantidad: 1, notas, opciones }]);
    setModalProducto(null);
  }

  function agregarCombo(comboId: string, comboNombre: string, comboItemsJson: string) {
    const internos: { precio: number; cantidad: number }[] = JSON.parse(comboItemsJson || "[]");
    const precioCombo = internos.reduce((sum, si) => sum + si.precio * si.cantidad, 0);
    setPedido((prev) => [
      ...prev,
      {
        producto: null,
        cantidad: 1,
        notas: "",
        opciones: "[]",
        precio: precioCombo,
        esCombo: true,
        comboId,
        comboNombre,
        comboItemsJson,
      },
    ]);
  }

  const total = useMemo(
    () => pedido.reduce((acc, item) => acc + calcularPrecioItem(item), 0),
    [pedido]
  );

  return {
    pedido,
    total,
    setPedido,
    cantidad: pedido.length,
    modalProducto,
    setModalProducto,
    agregarProducto,
    agregarCombo,
    modalPedidoAbierto,
    setModalPedidoAbierto,
  };
}
