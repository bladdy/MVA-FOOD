import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext.tsx";
import QRCodeGenerator from "@/React/Buttons/QRWithLogoButton";
import {
  getRestaurante,
  updateRestaurante,
} from "@/Services/restauranteService.ts";
import { showAlert } from "@/lib/alert.ts";
import type {
  Amenidad,
  Categoria,
  Horario,
  Plan,
  Restaurante,
  RestauranteDTO,
} from "@/Types/Restaurante.ts";
import { menuService } from "@/Services/menuService.ts";
//19d76c9b-115d-4470-8c3f-079c7b40f2f4 2e742b46-3756-41c6-87a7-e32df07ff19d
export default function RestauranteForm({ onSaved }: { onSaved?: () => void }) {
  const [restaurante, setRestaurante] = useState<Restaurante>({
    id: "",
    name: "",
    direccion: "",
    phone: "",
    slug:"",
    perfilImage: null,
    image: null,
    amenidades: [],
    categorias: [],
    horarios: [],
    tipos: [],
    plan: "" as unknown as Plan,
    horario: "",
    menus: []
  });

  const { user } = useUser();
  const [originalPerfilImage, setOriginalPerfilImage] = useState<string | null>(
    null
  );
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
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
  const diasMap: Record<number, string> = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
  };

  const diasOrden: string[] = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const normalizeTime = (time: string) => {
    if (!time) return "09:00";
    const match = time.match(/(\d{1,2})[:.](\d{2})/);
    if (!match) return "09:00";
    const hours = match[1].padStart(2, "0");
    const minutes = match[2];
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (user?.restauranteId) {
      Promise.all([
        getRestaurante(user.restauranteId),
        menuService.getAmenidades(),
        menuService.getCategorias(),
      ]).then(([data, amenidades, categorias]) => {
        setAmenidadesDisponibles(amenidades);
        setCategoriasDisponibles(categorias);

        setRestaurante((prev) => ({
          ...prev,
          id: data.id,
          name: data.name,
          slug: data.slug,
          direccion: data.direccion,
          phone: data.phone,
          perfilImage: data.perfilImage || null,
          image: data.image || null,
          amenidades: data.amenidades?.map((a: Amenidad) => a.id) || [],
          categorias: data.categorias?.map((c: Categoria) => c.id) || [],
          horarios: (
            data.horarios?.map((h: Horario) => ({
              id: h.id || "",
              dia: typeof h.dia === "number" ? diasMap[h.dia] : h.dia,
              horaApertura: normalizeTime(h.horaApertura),
              horaCierre: normalizeTime(h.horaCierre),
            })) || []
          ).sort(
            (a: any, b: any) =>
              diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia)
          ),

          tipos: data.tipos || [],
          plan: data.plan || "",
          horario: data.horario || "",
          menus: data.menus || [],
        }));

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

  const handleAddItem = (field: "amenidades" | "categorias", id: string) => {
    if (id && !restaurante[field].includes(id)) {
      setRestaurante((prev) => ({
        ...prev,
        [field]: [...prev[field], id],
      }));
    }
  };

  const handleRemoveItem = (field: "amenidades" | "categorias", id: string) => {
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
        { id: "", dia: "Lunes", horaApertura: "09:00", horaCierre: "18:00", diaTexto: "Lunes", horaAperturaTexto: "09:00", horaCierreTexto: "18:00" },
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
    if (!user?.restauranteId || submitting) return;

    setSubmitting(true);

    const form: RestauranteDTO = {
      ...restaurante,
      amenidades: restaurante.amenidades.filter((id) => !!id),
      categorias: restaurante.categorias.filter((id) => !!id),
      horarios: restaurante.horarios.map((h) => ({
        id: h.id,
        dia: h.dia,
        horaApertura: h.horaApertura,
        horaCierre: h.horaCierre,
        horaAperturaTexto: h.horaApertura,
        horaCierreTexto: h.horaCierre,
        diaTexto: h.dia,
      })),
    };

    try {
      await updateRestaurante(user.restauranteId, form);
      showAlert("Restaurante actualizado correctamente", "success");
      onSaved && onSaved();
    } catch {
      showAlert("Error al actualizar restaurante", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (<>
  <QRCodeGenerator url={`https://mr-menus.com/menus/${restaurante.slug}` } logo={restaurante.image ?? ""} />
      <form
        onSubmit={handleSubmit}
        className="space-y-8 p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold text-gray-800 border-b border-orange-200 pb-3">
          Perfil del Restaurante
        </h2>

      {/* Información básica */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="name"
            value={restaurante.name}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="text"
            name="phone"
            value={restaurante.phone}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={restaurante.direccion}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors"
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
              src={`${restaurante.perfilImage}`}
              alt="preview"
              className="mt-2 h-16 w-16 object-cover rounded-md"
            />
          ) : null}
        </div>

        {/* Imagen Portada */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagen Portada
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
              src={`${restaurante.image}`}
              alt="preview"
              className="mt-2 h-16 w-16 object-cover rounded-md"
            />
          ) : null}
        </div>
      </div>

      {/* Amenidades */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
        <legend className="font-semibold text-orange-700 px-2">Amenidades</legend>
        <div className="flex gap-2">
          <select
            onChange={(e) => handleAddItem("amenidades", e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
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
        <div className="flex flex-wrap gap-2">
          {restaurante.amenidades.map((id) => {
            const amenidad = amenidadesDisponibles.find((a) => a.id === id);
            return (
              <span
                key={id}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full flex items-center gap-2 text-sm"
              >
                {amenidad?.nombre}
                <button
                  type="button"
                  onClick={() => handleRemoveItem("amenidades", id)}
                  className="text-red-500 hover:text-red-700 font-bold leading-none"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </fieldset>

      {/* Categorías */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
        <legend className="font-semibold text-orange-700 px-2">Categorías</legend>
        <div className="flex gap-2">
          <select
            onChange={(e) => handleAddItem("categorias", e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
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
        <div className="flex flex-wrap gap-2">
          {restaurante.categorias.map((id) => {
            const categoria = categoriasDisponibles.find((c) => c.id === id);
            return (
              <span
                key={id}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full flex items-center gap-2 text-sm"
              >
                {categoria?.nombre}
                <button
                  type="button"
                  onClick={() => handleRemoveItem("categorias", id)}
                  className="text-red-500 hover:text-red-700 font-bold leading-none"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </fieldset>

      {/* Horarios */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
        <legend className="font-semibold text-orange-700 px-2">Horarios</legend>
        {restaurante.horarios.map((h, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <select
              value={h.dia}
              onChange={(e) =>
                handleHorarioChange(index, "dia", e.target.value)
              }
              className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none"
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
              value={h.horaApertura}
              onChange={(e) =>
                handleHorarioChange(index, "horaApertura", e.target.value)
              }
              className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none"
            />
            <input
              type="time"
              value={h.horaCierre}
              onChange={(e) =>
                handleHorarioChange(index, "horaCierre", e.target.value)
              }
              className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none"
            />
            <button
              type="button"
              onClick={() => handleRemoveHorario(index)}
              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
            >
              Eliminar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddHorario}
          className="px-4 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-md text-sm font-medium transition-colors"
        >
          + Agregar Horario
        </button>
      </fieldset>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => window.history.back()}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 transition-colors ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {submitting && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          )}
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  </>
  );
}
