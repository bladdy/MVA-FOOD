import { useEffect, useState } from "react";

export default function BotonVerPedido({
  total,
  cantidad,
  onClick,
}: {
  total: number;
  cantidad: number;
  onClick: () => void;
}) {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      const footer = document.querySelector("footer");
      if (!footer) return;
      const vh = window.innerHeight;
      const footerTop = footer.getBoundingClientRect().top;
      setBottomOffset(Math.max(0, vh - footerTop));
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{ bottom: bottomOffset }}
    >
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
