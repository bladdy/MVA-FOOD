import { useEffect, useState, useRef } from "react";
import { tipoEntregaService } from "@/Services/tipoEntregaService.ts";
import { useUser } from "@/context/UserContext.tsx";
import type { TipoEntregaResponse } from "@/Types/Restaurante.ts";
import TipoEntregaModal from "./TipoEntregaModal.tsx";

const NOMBRES_FIJOS = ["A domicilio", "Para recoger"];

export default function TipoEntregaManager() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;
  const [tipos, setTipos] = useState<TipoEntregaResponse[]>([]);
  const [editando, setEditando] = useState<TipoEntregaResponse | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [showAgregar, setShowAgregar] = useState(false);
  const agregarRef = useRef<HTMLDivElement>(null);

  const cargar = async () => {
    if (!restauranteId) return;
    const data = await tipoEntregaService.getAll(restauranteId);
    setTipos(data);
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

  const nombresExistentes = new Set(tipos.map((t) => t.nombre));
  const pendientes = NOMBRES_FIJOS.filter((n) => !nombresExistentes.has(n));

  const handleEdit = (tipo: TipoEntregaResponse) => {
    setEditando(tipo);
    setModalAbierto(true);
  };

  const handleSave = async () => {
    setModalAbierto(false);
    setEditando(null);
    cargar();
  };

  const handleToggleActivo = async (tipo: TipoEntregaResponse) => {
    await tipoEntregaService.update(tipo.id, {
      nombre: tipo.nombre,
      tiempoMinutos: tipo.tiempoMinutos,
      costoFijo: tipo.costoFijo,
      porcentaje: tipo.porcentaje,
      activo: !tipo.activo,
    });
    cargar();
  };

  const handleAgregar = async (nombre: string) => {
    if (!restauranteId) return;
    await tipoEntregaService.create(restauranteId, {
      nombre,
      tiempoMinutos: 30,
      activo: true,
    });
    setShowAgregar(false);
    cargar();
  };

  if (!restauranteId) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tipos de entrega</h1>
        {pendientes.length > 0 && (
          <div ref={agregarRef} className="relative">
            <button
              onClick={() => setShowAgregar(!showAgregar)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Agregar tipo de entrega
            </button>
            {showAgregar && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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
        Configura los tipos de entrega disponibles para tu restaurante.
        Los nombres son fijos: <strong>A domicilio</strong> y <strong>Para recoger</strong>.
        Solo puedes activar/desactivar y configurar tiempo y costo.
      </p>

      {tipos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay tipos de entrega configurados</p>
      ) : (
        <div className="grid gap-4">
          {tipos.map((tipo) => (
            <div
              key={tipo.id}
              className={`border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                tipo.activo ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{tipo.nombre}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tipo.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {tipo.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Tiempo: <strong>{tipo.tiempoMinutos ?? "—"} min</strong></span>
                  <span>
                    Costo:{" "}
                    <strong>
                      {tipo.costoFijo != null
                        ? `$${tipo.costoFijo.toFixed(2)} fijo`
                        : tipo.porcentaje != null
                          ? `${tipo.porcentaje}% del subtotal`
                          : "Gratis"}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActivo(tipo)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    tipo.activo
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {tipo.activo ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => handleEdit(tipo)}
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
        <TipoEntregaModal
          tipo={editando}
          onClose={() => { setModalAbierto(false); setEditando(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
