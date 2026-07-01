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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{cantidad} producto{cantidad !== 1 ? "s" : ""}</div>
          <div className="text-xl font-bold text-orange-600">${total.toLocaleString("es-MX")}</div>
        </div>
        <button
          onClick={onClick}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-colors"
        >
          Ver pedido
        </button>
      </div>
    </div>
  );
}
