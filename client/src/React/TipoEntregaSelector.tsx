// TipoEntregaSelector.tsx
import { useState } from "react";

export default function TipoEntregaSelector({
  tipoEntrega,
  setTipoEntrega,
}: {
  tipoEntrega: "domicilio" | "recoger";
  setTipoEntrega: (tipo: "domicilio" | "recoger") => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="inline-flex bg-gray-100 rounded-full p-1 mb-2">
        <button
          onClick={() => setTipoEntrega("domicilio")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
            tipoEntrega === "domicilio"
              ? "bg-white text-orange-600 shadow"
              : "text-gray-600 hover:text-black"
          }`}
        >
          A domicilio
        </button>
        <button
          onClick={() => setTipoEntrega("recoger")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
            tipoEntrega === "recoger"
              ? "bg-white text-orange-600 shadow"
              : "text-gray-600 hover:text-black"
          }`}
        >
          Para recoger
        </button>
      </div>

      <div className="flex gap-6 text-sm text-gray-700">
        <div className="flex flex-col items-center">
          <span className="text-gray-500">Tiempo envío</span>
          <span className="font-semibold">
            {tipoEntrega === "domicilio" ? "25 - 45 mins" : "5 - 10 mins"}
          </span>
        </div>
        <div className="border-l h-6 self-center" />
        <div className="flex flex-col items-center">
          <span className="text-gray-500">Costo envío</span>
          <span className="font-semibold">
            {tipoEntrega === "domicilio" ? "Desde $20" : "Gratis"}
          </span>
        </div>
      </div>
    </div>
  );
}
