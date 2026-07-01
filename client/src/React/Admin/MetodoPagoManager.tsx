import { useEffect, useState, useRef } from "react";
import { metodoPagoService } from "@/Services/metodoPagoService.ts";
import { useUser } from "@/context/UserContext.tsx";
import type { MetodoPagoResponse } from "@/Types/Restaurante.ts";
import MetodoPagoModal from "./MetodoPagoModal.tsx";

const NOMBRES_FIJOS = ["Efectivo", "Tarjeta de crédito/débito", "Transferencia"];

export default function MetodoPagoManager() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;
  const [metodos, setMetodos] = useState<MetodoPagoResponse[]>([]);
  const [editando, setEditando] = useState<MetodoPagoResponse | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [showAgregar, setShowAgregar] = useState(false);
  const agregarRef = useRef<HTMLDivElement>(null);

  const cargar = async () => {
    if (!restauranteId) return;
    const data = await metodoPagoService.getAll(restauranteId);
    setMetodos(data);
  };

  useEffect(() => {
    cargar();
  }, [restauranteId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (agregarRef.current && !agregarRef.current.contains(e.target as Node)) {
        setShowAgregar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nombresExistentes = new Set(metodos.map((t) => t.nombre));
  const pendientes = NOMBRES_FIJOS.filter((n) => !nombresExistentes.has(n));

  const handleEdit = (metodo: MetodoPagoResponse) => {
    setEditando(metodo);
    setModalAbierto(true);
  };

  const handleSave = async () => {
    setModalAbierto(false);
    setEditando(null);
    cargar();
  };

  const handleToggleActivo = async (metodo: MetodoPagoResponse) => {
    await metodoPagoService.update(metodo.id, {
      nombre: metodo.nombre,
      activo: !metodo.activo,
    });
    cargar();
  };

  const handleAgregar = async (nombre: string) => {
    if (!restauranteId) return;
    await metodoPagoService.create(restauranteId, {
      nombre,
      activo: true,
    });
    setShowAgregar(false);
    cargar();
  };

  if (!restauranteId) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Métodos de pago</h1>
        {pendientes.length > 0 && (
          <div ref={agregarRef} className="relative">
            <button
              onClick={() => setShowAgregar(!showAgregar)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Agregar método de pago
            </button>
            {showAgregar && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {pendientes.map((nombre) => (
                  <button
                    key={nombre}
                    onClick={() => handleAgregar(nombre)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Configura los métodos de pago disponibles para tu restaurante.
        Los nombres son fijos. Solo puedes activar o desactivar cada método.
      </p>

      {metodos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay métodos de pago configurados</p>
      ) : (
        <div className="grid gap-4">
          {metodos.map((metodo) => (
            <div
              key={metodo.id}
              className={`border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                metodo.activo ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{metodo.nombre}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      metodo.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {metodo.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActivo(metodo)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    metodo.activo
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {metodo.activo ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => handleEdit(metodo)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  Configurar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <MetodoPagoModal
          metodo={editando}
          onClose={() => { setModalAbierto(false); setEditando(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
