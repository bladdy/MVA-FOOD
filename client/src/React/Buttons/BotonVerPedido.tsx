// components/BotonVerPedido.tsx
export default function BotonVerPedido({
  total,
  cantidad,
  onClick,
}: {
  total: number;
  cantidad: number;
  onClick: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={onClick}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-4"
      >
        <div>
          <div className="text-xs">{cantidad} producto(s)</div>
          <div className="text-base font-bold">${total.toLocaleString("es-MX")}</div>
        </div>
        <span>Ver pedido</span>
      </button>
    </div>
  );
}
