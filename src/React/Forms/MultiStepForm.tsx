// components/MultiStepRestaurantForm.jsx
import { useState } from "react";

const diasSemana = ["Lunes a Viernes", "Sábado", "Domingo"];

const amnidadesDisponibles = [
  { svg: "area-exterior.svg", name: "Área Exterior" },
  { svg: "delivery.svg", name: "Delivery" },
  { svg: "wifi.svg", name: "Wifi" },
];

const tiposDisponibles = [
  "Americana",
  "Pollo",
  "Comida Rápida",
  "Italiana",
  "Vegetariana",
];

// Datos ficticios de ubicación
const paises = ["México", "República Dominicana"];
const estados: { [key: string]: string[] } = {
  México: ["Jalisco", "CDMX"],
  "República Dominicana": ["Santo Domingo", "Santiago"],
};
const ciudades: { [key: string]: string[] } = {
  Jalisco: ["Guadalajara"],
  CDMX: ["Coyoacán"],
  "Santo Domingo": ["Naco"],
  Santiago: ["Los Jardines"],
};
const colonias: { [key: string]: string[] } = {
  Guadalajara: ["Centro", "Oblatos"],
  Naco: ["Bella Vista"],
  "Los Jardines": ["La Villa"],
};

type Amenidad = { svg: string; name: string };
type Horario = { dia: string; apertura: string; cierre: string };

type FormState = {
  name: string;
  tipos: string[];
  descripcion: string;
  direccion: {
    pais: string;
    estado: string;
    ciudad: string;
    colonia: string;
    calle: string;
    numero: string;
    codigoPostal: string;
  };
  phone: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  horario: Horario[];
  amnidades: Amenidad[];
  image: File | null;
  perfilImage: File | null;
};

export default function MultiStepRestaurantForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    name: "",
    tipos: [],
    descripcion: "",
    direccion: {
      pais: "",
      estado: "",
      ciudad: "",
      colonia: "",
      calle: "",
      numero: "",
      codigoPostal: "",
    },
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    horario: diasSemana.map((dia) => ({
      dia,
      apertura: "",
      cierre: "",
    })),
    amnidades: [],
    image: null,
    perfilImage: null,
  });

  const updateField = (field: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateDireccion = (
    field: keyof FormState["direccion"],
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      direccion: { ...prev.direccion, [field]: value },
    }));

  const toggleTipo = (tipo: string) => {
    const tipos = [...form.tipos];
    if (tipos.includes(tipo)) {
      updateField(
        "tipos",
        tipos.filter((t) => t !== tipo)
      );
    } else {
      tipos.push(tipo);
      updateField("tipos", tipos);
    }
  };

  const toggleAmenidad = (name: string) => {
    const actual = form.amnidades.map((a) => a.name);
    if (actual.includes(name)) {
      updateField(
        "amnidades",
        form.amnidades.filter((a) => a.name !== name)
      );
    } else {
      const nueva = amnidadesDisponibles.find((a) => a.name === name);
      updateField("amnidades", [...form.amnidades, nueva!]);
    }
  };

  const handleHorarioChange = (
    index: number,
    field: keyof Horario,
    value: string
  ) => {
    const newHorario = [...form.horario];
    newHorario[index][field] = value;
    updateField("horario", newHorario);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Formulario final:", form);
  };

  const selectedPais = form.direccion.pais;
  const selectedEstado = form.direccion.estado;
  const selectedCiudad = form.direccion.ciudad;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-orange-600">
        Registro de Restaurante
      </h2>

      {/* Paso 1: Info General */}
      {step === 1 && (
        <div className="space-y-4">
          <label className="block">
            Nombre:
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </label>

          <label className="block">
            Teléfono:
            <input
              type="tel"
              className="w-full p-2 border rounded"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </label>

          <label className="block">
            WhatsApp:
            <input
              type="tel"
              className="w-full p-2 border rounded"
              value={form.whatsapp || ""}
              onChange={(e) => updateField("whatsapp", e.target.value)}
            />
          </label>

          <label className="block">
            Facebook:
            <input
              type="url"
              className="w-full p-2 border rounded"
              value={form.facebook || ""}
              onChange={(e) => updateField("facebook", e.target.value)}
              placeholder="https://facebook.com/tu-restaurante"
            />
          </label>

          <label className="block">
            Instagram:
            <input
              type="url"
              className="w-full p-2 border rounded"
              value={form.instagram || ""}
              onChange={(e) => updateField("instagram", e.target.value)}
              placeholder="https://instagram.com/tu-restaurante"
            />
          </label>

          <label className="block">
            TikTok:
            <input
              type="url"
              className="w-full p-2 border rounded"
              value={form.tiktok || ""}
              onChange={(e) => updateField("tiktok", e.target.value)}
              placeholder="https://tiktok.com/@tu-restaurante"
            />
          </label>

          <label className="block">
            Tipo(s):
            <div className="flex flex-wrap gap-2 mt-2">
              {tiposDisponibles.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => toggleTipo(tipo)}
                  className={`px-3 py-1 rounded border ${
                    form.tipos.includes(tipo)
                      ? "bg-orange-600 text-white"
                      : "bg-orange-700 text-white"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            Descripción:
            <textarea
              className="w-full p-2 border rounded"
              value={form.descripcion}
              onChange={(e) => updateField("descripcion", e.target.value)}
            />
          </label>
        </div>
      )}

      {/* Paso 2: Contacto */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Dirección</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Pais</label>
              <select
                className="w-full p-2 border rounded"
                value={form.direccion.pais}
                onChange={(e) => updateDireccion("pais", e.target.value)}
              >
                <option value="">Selecciona país</option>
                {paises.map((pais) => (
                  <option key={pais} value={pais}>
                    {pais}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Estado</label>
              <select
                className="w-full p-2 border rounded"
                value={form.direccion.estado}
                onChange={(e) => updateDireccion("estado", e.target.value)}
              >
                <option value="">Selecciona estado</option>
                {(estados[selectedPais] || []).map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Ciudad</label>
              <select
                className="w-full p-2 border rounded"
                value={form.direccion.ciudad}
                onChange={(e) => updateDireccion("ciudad", e.target.value)}
              >
                <option value="">Selecciona ciudad</option>
                {(ciudades[selectedEstado] || []).map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Colonia / Sector</label>
              <select
                className="w-full p-2 border rounded"
                value={form.direccion.colonia}
                onChange={(e) => updateDireccion("colonia", e.target.value)}
              >
                <option value="">Selecciona colonia</option>
                {(colonias[selectedCiudad] || []).map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Calle</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={form.direccion.calle}
                onChange={(e) => updateDireccion("calle", e.target.value)}
              />
            </div>

            <div>
              <label>Número</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={form.direccion.numero}
                onChange={(e) => updateDireccion("numero", e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label>Código Postal</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={form.direccion.codigoPostal}
                onChange={(e) =>
                  updateDireccion("codigoPostal", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Horarios */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Horario de Atención</h3>
          {form.horario.map((h, idx) => (
            <div key={h.dia} className="flex gap-2 items-center">
              <span className="w-32">{h.dia}</span>
              <input
                type="time"
                value={h.apertura}
                onChange={(e) =>
                  handleHorarioChange(idx, "apertura", e.target.value)
                }
              />
              <span>a</span>
              <input
                type="time"
                value={h.cierre}
                onChange={(e) =>
                  handleHorarioChange(idx, "cierre", e.target.value)
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Paso 4: Amenidades */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Amenidades</h3>
          <div className="flex flex-wrap gap-2">
            {amnidadesDisponibles.map((a) => (
              <button
                key={a.name}
                type="button"
                onClick={() => toggleAmenidad(a.name)}
                className={`border px-3 py-1 rounded ${
                  form.amnidades.some((am) => am.name === a.name)
                    ? "bg-orange-600 text-white"
                    : "bg-orange-700 text-white"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 5: Imágenes */}
      {step === 5 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-center text-orange-600">
            Sube tus imágenes
          </h3>

          {/* Logo */}
          <div className="col-span-full">
            <label
              htmlFor="logo"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Logo
            </label>
            <img
              src={
                form.image
                  ? URL.createObjectURL(form.image)
                  : "img/placeholder-logo.png"
              }
              alt="Vista previa del logo"
              className="w-24 h-24 object-cover rounded-full border border-gray-300 mb-3"
            />
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) =>
                updateField("image", e.target.files?.[0] ?? null)
              }
              className="block text-sm file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-gray-200"
            />
          </div>

          {/* Portada */}
          <div className="col-span-full">
            <label
              htmlFor="perfilImage"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Portada
            </label>
            <img
              src={
                form.perfilImage
                  ? URL.createObjectURL(form.perfilImage)
                  : "img/placeholder-portada.png"
              }
              alt="Vista previa portada"
              className="w-full object-fill rounded border border-gray-300 mb-3 bg-gray-100"
            />
            <input
              id="perfilImage"
              type="file"
              accept="image/*"
              onChange={(e) =>
                updateField("perfilImage", e.target.files?.[0] ?? null)
              }
              className="block text-sm file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-gray-200"
            />
          </div>
        </div>
      )}
      {/* Paso 6: Resumen */}
      {step === 6 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-center text-orange-600">
            Resumen
          </h3>

          <div className="bg-gray-50 p-4 rounded shadow space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1 text-lg">
                Información general
              </h4>
              <p>
                <strong>Nombre:</strong> {form.name}
              </p>
              <p>
                <strong>Tipos:</strong> {form.tipos.join(", ")}
              </p>
              <p>
                <strong>Descripción:</strong>{" "}
                {form.descripcion || "No proporcionada"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-1 text-lg">
                Contacto
              </h4>
              <p>
                <strong>Dirección:</strong>{" "}
                {[
                  form.direccion.calle,
                  form.direccion.numero,
                  form.direccion.colonia,
                  form.direccion.ciudad,
                  form.direccion.estado,
                  form.direccion.pais,
                  form.direccion.codigoPostal,
                ]
                  .filter(Boolean)
                  .join(", ") || "No proporcionada"}
              </p>
              <p>
                <strong>Teléfono:</strong> {form.phone || "No proporcionado"}
              </p>
              <p>
                <strong>WhatsApp:</strong> {form.whatsapp || "No proporcionado"}
              </p>
              <p>
                <strong>Facebook:</strong> {form.facebook || "No proporcionado"}
              </p>
              <p>
                <strong>Instagram:</strong>{" "}
                {form.instagram || "No proporcionado"}
              </p>
              <p>
                <strong>TikTok:</strong> {form.tiktok || "No proporcionado"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-1 text-lg">
                Horario de atención
              </h4>
              {form.horario.map((h, idx) => (
                <p key={idx}>
                  <strong>{h.dia}:</strong> {h.apertura || "--"} a{" "}
                  {h.cierre || "--"}
                </p>
              ))}
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-1 text-lg">
                Amenidades
              </h4>
              <p>
                {form.amnidades.length > 0
                  ? form.amnidades.map((a) => a.name).join(", ")
                  : "Ninguna seleccionada"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-1 text-lg">
                Imágenes
              </h4>
              <p>
                <strong>Logo:</strong>{" "}
                {form.image ? form.image.name : "No seleccionada"}
              </p>
              <p>
                <strong>Portada:</strong>{" "}
                {form.perfilImage ? form.perfilImage.name : "No seleccionada"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-4 py-2 bg-orange-600 rounded text-white"
          >
            Atrás
          </button>
        )}
        {step < 6 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="px-4 py-2 bg-orange-600 text-white rounded"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 text-white rounded"
          >
            Guardar
          </button>
        )}
      </div>
    </form>
  );
}
