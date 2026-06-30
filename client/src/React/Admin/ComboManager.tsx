import { useEffect, useState } from "react";
import { comboService } from "@/Services/comboService.ts";
import { useUser } from "@/context/UserContext.tsx";
import type { ComboResponse } from "@/Types/Restaurante.ts";
import ComboModal from "./ComboModal.tsx";
import ComboTable from "./ComboTable.tsx";

export default function ComboManager() {
  const { user } = useUser();
  const restauranteId = user?.restauranteId;
  const [combos, setCombos] = useState<ComboResponse[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<ComboResponse | null>(null);

  const cargar = async () => {
    if (!restauranteId) return;
    const data = await comboService.getAll(restauranteId);
    setCombos(data);
  };

  useEffect(() => {
    cargar();
  }, [restauranteId]);

  const handleCreate = () => {
    setEditando(null);
    setModalAbierto(true);
  };

  const handleEdit = (combo: ComboResponse) => {
    setEditando(combo);
    setModalAbierto(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este combo?")) return;
    await comboService.delete(id);
    cargar();
  };

  const handleSave = async () => {
    setModalAbierto(false);
    setEditando(null);
    cargar();
  };

  if (!restauranteId) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Combos</h1>
        <button
          onClick={handleCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nuevo Combo
        </button>
      </div>
      <ComboTable combos={combos} onEdit={handleEdit} onDelete={handleDelete} />
      {modalAbierto && (
        <ComboModal
          combo={editando}
          restauranteId={restauranteId}
          onClose={() => setModalAbierto(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
