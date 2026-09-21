import { useEffect, useState } from "react";
import { mesaService } from "@/Services/mesaService.ts";
import { UserProvider, useUser } from "@/context/UserContext.tsx";
import type { Mesa } from "@/Types/Restaurante.ts";

interface MesaFormState {
  numero: string;
  capacidad: string;
  codigo: string;
}

const FORM_VACIO: MesaFormState = { numero: "", capacidad: "4", codigo: "" };

function MesaManagerInner() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Mesa | null>(null);
  const [form, setForm] = useState<MesaFormState>(FORM_VACIO);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    if (!restauranteId) return;
    try {
      setCargando(true);
      const data = await mesaService.getAll(restauranteId);
      setMesas(data);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [restauranteId]);

  const abrirNueva = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setError("");
    setModalAbierto(true);
  };

  const abrirEdicion = (mesa: Mesa) => {
    setEditando(mesa);
    setForm({
      numero: String(mesa.numero),
      capacidad: String(mesa.capacidad),
      codigo: mesa.codigo,
    });
    setError("");
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!restauranteId) return;
    const numero = parseInt(form.numero, 10);
    const capacidad = parseInt(form.capacidad, 10);
    if (isNaN(numero) || numero <= 0) {
      setError("Ingresa un número de mesa válido");
      return;
    }
    if (isNaN(capacidad) || capacidad <= 0) {
      setError("Ingresa una capacidad válida");
      return;
    }

    const payload = {
      numero,
      capacidad,
      codigo: form.codigo.trim() || `M${String(numero).padStart(2, "0")}`,
      estaOcupada: editando ? editando.estaOcupada : false,
      restauranteId,
    };

    try {
      if (editando) {
        await mesaService.update(editando.id, payload);
      } else {
        await mesaService.create(payload);
      }
      setModalAbierto(false);
      cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const eliminar = async (mesa: Mesa) => {
    if (!confirm(`¿Eliminar la mesa ${mesa.numero}?`)) return;
    try {
      await mesaService.delete(mesa.id);
      cargar();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (!restauranteId) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mesas</h1>
          <p className="text-sm text-gray-500">
            Administra las mesas que usa el mesero para tomar órdenes.
          </p>
        </div>
        <button
          onClick={abrirNueva}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nueva mesa
        </button>
      </div>

      {cargando && <p className="text-center text-gray-500 py-10">Cargando mesas...</p>}

      {!cargando && mesas.length === 0 && (
        <p className="text-gray-500 text-center py-10">
          No hay mesas configuradas. Crea la primera mesa con el botón de arriba.
        </p>
      )}

      {mesas.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              className={`border rounded-xl p-4 flex items-center justify-between gap-3 ${
                mesa.estaOcupada
                  ? "border-orange-300 bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center text-lg font-bold text-white ${
                    mesa.estaOcupada ? "bg-orange-500" : "bg-green-500"
                  }`}
                >
                  {mesa.numero}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Mesa {mesa.numero}
                    <span className="ml-2 text-xs text-gray-400 font-normal">{mesa.codigo}</span>
                  </p>
                  <p className="text-sm text-gray-500">Capacidad: {mesa.capacidad} personas</p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      mesa.estaOcupada
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {mesa.estaOcupada ? "Ocupada" : "Libre"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => abrirEdicion(mesa)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(mesa)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editando ? `Editar mesa ${editando.numero}` : "Nueva mesa"}
            </h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">Número de mesa</label>
            <input
              type="number"
              value={form.numero}
              onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              min="1"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
            <input
              type="number"
              value={form.capacidad}
              onChange={(e) => setForm((f) => ({ ...f, capacidad: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              min="1"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Código (opcional)</label>
            <input
              type="text"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              placeholder="M01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
            />

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
              >
                {editando ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MesaManager() {
  return (
    <UserProvider>
      <MesaManagerInner />
    </UserProvider>
  );
}
