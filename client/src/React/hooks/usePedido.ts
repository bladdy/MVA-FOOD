// hooks/usePedido.ts
import { useState } from "react";
import type { Menu, PedidoItem } from "@/Types/Restaurante";
interface UsePedidoHook {
  pedido: PedidoItem[];
  setPedido: React.Dispatch<React.SetStateAction<PedidoItem[]>>;
  total: number;
  cantidad: number;
  modalProducto: Menu | null;
  setModalProducto: React.Dispatch<React.SetStateAction<Menu | null>>;
  agregarProducto: (producto: Menu, notas?: string) => void;
  modalPedidoAbierto: boolean;
  setModalPedidoAbierto: React.Dispatch<React.SetStateAction<boolean>>;
}

export function usePedido(): UsePedidoHook {
  const [pedido, setPedido] = useState<PedidoItem[]>([]);
  const [modalProducto, setModalProducto] = useState<Menu | null>(null);
  const [modalPedidoAbierto, setModalPedidoAbierto] = useState(false);

  function agregarProducto(producto: Menu, notas = "") {
    setPedido((prev) => [...prev, { producto, cantidad: 1, notas }]);
    setModalProducto(null); // cerrar modal
  }

  const total = pedido.reduce((acc, item) => acc + item.producto.price * item.cantidad, 0);

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
