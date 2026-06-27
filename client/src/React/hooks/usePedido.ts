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
  modalPedidoAbierto: boolean;
  setModalPedidoAbierto: React.Dispatch<React.SetStateAction<boolean>>;
}

function calcularPrecioItem(item: PedidoItem): number {
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
    modalPedidoAbierto,
    setModalPedidoAbierto,
  };
}
