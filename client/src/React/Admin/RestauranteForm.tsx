import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext.tsx";
import {
  getRestaurante,
  updateRestaurante,
} from "@/Services/restauranteService.ts";
import type {
  Amenidad,
  Categoria,
  Horario,
  Restaurante,
  RestauranteUpdateDto,
} from "@/Types/Restaurante.ts";
import { menuService } from "@/Services/menuService.ts";
//19d76c9b-115d-4470-8c3f-079c7b40f2f4 2e742b46-3756-41c6-87a7-e32df07ff19d
export default function RestauranteForm({ onSaved }: { onSaved?: () => void }) {
  const [restaurante, setRestaurante] = useState<Restaurante>({
    id: "",
    name: "",
    direccion: "",
    phone: "",
    perfilImage: null,
    image: null,
    amnidades: [],
    categorias: [],
    horarios: [],
    tipos: [],
    plan: "",
    horario: "",
    menus: [],
  });

  const { user } = useUser();
  const [originalPerfilImage, setOriginalPerfilImage] = useState<string | null>(
    null
  );
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const [amenidadesDisponibles, setAmenidadesDisponibles] = useState<
    Amenidad[]
  >([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<
    Categoria[]
  >([]);

  // Cargar amenidades y categorías
  useEffect(() => {
    menuService.getAmenidades().then(setAmenidadesDisponibles);
    menuService.getCategorias().then(setCategoriasDisponibles);
  }, []);

  // Cargar restaurante actual
  useEffect(() => {
    if (user?.restauranteId) {
      Promise.all([
        getRestaurante(user.restauranteId),
        menuService.getAmenidades(),
        menuService.getCategorias(),
      ]).then(([data, amenidades, categorias]) => {
        setAmenidadesDisponibles(amenidades);
        setCategoriasDisponibles(categorias);

        setRestaurante({
          ...restaurante,
          id: data.id,
          name: data.name,
          direccion: data.direccion,
          phone: data.phone,
          perfilImage: null,
          image: null,
          amnidades: data.amenidades?.map((a: Amenidad) => a.id) || [],
          categorias: data.categorias?.map((c: Categoria) => c.id) || [],
          horarios: data.horarios || [],
          tipos: data.tipos || [],
          plan: data.plan || "",
          horario: data.horario || "",
          menus: data.menus || [],
        });
        setOriginalPerfilImage(data.perfilImage || null);
        setOriginalImage(data.image || null);
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file" && files) {
      setRestaurante((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setRestaurante((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = (field: "amnidades" | "categorias", id: string) => {
    if (id && !restaurante[field].includes(id)) {
      setRestaurante((prev) => ({
        ...prev,
        [field]: [...prev[field], id],
      }));
    }
  };

  const handleRemoveItem = (field: "amnidades" | "categorias", id: string) => {
    setRestaurante((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== id),
    }));
  };

  const handleAddHorario = () => {
    setRestaurante((prev) => ({
      ...prev,
      horarios: [
        ...prev.horarios,
        { dia: "Lunes", apertura: "09:00", cierre: "18:00" },
      ],
    }));
  };

  const handleHorarioChange = (
    index: number,
    field: keyof Horario,
    value: string
  ) => {
    const horarios = [...restaurante.horarios];
    horarios[index][field] = value;
    setRestaurante((prev) => ({ ...prev, horarios }));
  };

  const handleRemoveHorario = (index: number) => {
    setRestaurante((prev) => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restauranteId) return;
    // 🚀 Construcción del objeto final para enviar
    const form: Restaurante = {
      ...restaurante,
      amnidades: restaurante.amnidades.filter((id) => !!id), // array de strings
      categorias: restaurante.categorias.filter((id) => !!id), // array de strings
      horarios: restaurante.horarios.map((h) => ({
        dia: h.dia,
        apertura: h.apertura,
        cierre: h.cierre,
      })),
    };

    try {
      await updateRestaurante(user.restauranteId, form);
      alert("Restaurante actualizado correctamente");
      onSaved && onSaved();
    } catch {
      alert("Error al actualizar restaurante");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold">Actualizar Restaurante</h2>

      {/* Información básica */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block font-medium">Nombre</label>
          <input
            type="text"
            name="name"
            value={restaurante.name}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Teléfono</label>
          <input
            type="text"
            name="phone"
            value={restaurante.phone}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border px-3 py-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-medium">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={restaurante.direccion}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border px-3 py-2"
          />
        </div>

        {/* Imagen de Perfil */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagen de Perfil
          </label>
          <input
            name="perfilImage"
            type="file"
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2 text-sm"
          />
          {restaurante.perfilImage &&
          typeof restaurante.perfilImage !== "string" ? (
            <img
              src={URL.createObjectURL(restaurante.perfilImage)}
              alt="preview"
              className="mt-2 h-16 w-16 object-cover rounded-md"
            />
          ) : originalPerfilImage ? (
            <img
              src={`http://localhost:5147${originalPerfilImage}`}
              alt="preview"
              className="mt-2 h-16 w-16 object-cover rounded-md"
            />
          ) : null}
        </div>

        {/* Imagen Principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagen Principal
          </label>
          <input
            name="image"
            type="file"
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2 text-sm"
          />
          {restaurante.image && typeof restaurante.image !== "string" ? (
            <img
              src={URL.createObjectURL(restaurante.image)}
              alt="preview"
              className="mt-2 h-16 w-16 object-cover rounded-md"
            />
          ) : originalImage ? (
            <img
              src={`http://localhost:5147${originalImage}`}
              alt="preview"
              className="mt-2 h-16 w-16 object-cover rounded-md"
            />
          ) : null}
        </div>
      </div>

      {/* Amenidades */}
      <fieldset className="space-y-2">
        <legend className="font-semibold">Amenidades</legend>
        <div className="flex gap-2">
          <select
            onChange={(e) => handleAddItem("amnidades", e.target.value)}
            className="border rounded-md p-2"
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona una amenidad
            </option>
            {amenidadesDisponibles.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {restaurante.amnidades.map((id) => {
            const amenidad = amenidadesDisponibles.find((a) => a.id === id);
            return (
              <span
                key={id}
                className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2"
              >
                {amenidad?.nombre}
                <button
                  type="button"
                  onClick={() => handleRemoveItem("amnidades", id)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </fieldset>

      {/* Categorías */}
      <fieldset className="space-y-2">
        <legend className="font-semibold">Categorías</legend>
        <div className="flex gap-2">
          <select
            onChange={(e) => handleAddItem("categorias", e.target.value)}
            className="border rounded-md p-2"
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categoriasDisponibles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {restaurante.categorias.map((id) => {
            const categoria = categoriasDisponibles.find((c) => c.id === id);
            return (
              <span
                key={id}
                className="px-3 py-1 bg-gray-200 rounded-full flex items-center gap-2"
              >
                {categoria?.nombre}
                <button
                  type="button"
                  onClick={() => handleRemoveItem("categorias", id)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </fieldset>

      {/* Horarios */}
      <fieldset className="space-y-2">
        <legend className="font-semibold">Horarios</legend>
        {restaurante.horarios.map((h, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={h.dia}
              onChange={(e) =>
                handleHorarioChange(index, "dia", e.target.value)
              }
              className="border rounded-md p-2"
            >
              {[
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
                "Domingo",
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={h.apertura}
              onChange={(e) =>
                handleHorarioChange(index, "apertura", e.target.value)
              }
              className="border rounded-md p-2"
            />
            <input
              type="time"
              value={h.cierre}
              onChange={(e) =>
                handleHorarioChange(index, "cierre", e.target.value)
              }
              className="border rounded-md p-2"
            />
            <button
              type="button"
              onClick={() => handleRemoveHorario(index)}
              className="px-2 py-1 bg-red-500 text-white rounded-md"
            >
              Eliminar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddHorario}
          className="px-3 py-1 bg-green-500 text-white rounded-md"
        >
          + Agregar Horario
        </button>
      </fieldset>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="px-4 py-2 rounded-md border"
          onClick={() => window.history.back()}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
