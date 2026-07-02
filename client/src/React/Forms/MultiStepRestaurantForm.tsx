import { useEffect, useState } from "react";
import { createRestaurante } from "@/Services/restauranteService";
import { menuService } from "@/Services/menuService";

type Props = { planId: string };

const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function RestaurantRegistrationForm({ planId }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [amenidades, setAmenidades] = useState<any[]>([]);
  const [usarMismoHorario, setUsarMismoHorario] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    slogan: "",
    nombreUsuario: "",
    username: "",
    password: "",
    image: null as File | null,
    perfilImage: null as File | null,
    categoriaIds: [] as string[],
    amenidadIds: [] as string[],
    horarioGeneral: { apertura: "08:00", cierre: "22:00" },
    horarios: dias.map((d) => ({ dia: d, apertura: "08:00", cierre: "22:00" }))
  });

useEffect(() => {
  const loadData = async () => {
    try {
      const [c, a] = await Promise.all([
        menuService.getCategorias(),
        menuService.getAmenidades()
      ]);

      setCategorias(c);
      setAmenidades(a);
    } catch {
      setErrorMessage(
        "No fue posible cargar las categorías y amenidades."
      );
    }
  };

  loadData();
}, []);

  const mapDia = (d: string) => dias.findIndex(x => x === d);

  const submit = async (e: any) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const horarios = usarMismoHorario
        ? dias.map((d, i) => ({
          dia: i,
          horaApertura: form.horarioGeneral.apertura,
          horaCierre: form.horarioGeneral.cierre,
        }))
        : form.horarios.map((h) => ({
          dia: mapDia(h.dia),
          horaApertura: h.apertura,
          horaCierre: h.cierre,
        }));

      await createRestaurante({
        nombre: form.nombre,
        direccion: form.direccion,
        slogan: form.slogan,
        telefono: form.telefono,
        nombreUsuario: form.nombreUsuario,
        username: form.username,
        password: form.password,
        planId,
        image: form.image,
        perfilImage: form.perfilImage,
        categoriaIds: form.categoriaIds,
        amenidadIds: form.amenidadIds,
        horarios,
      });

      setSuccessMessage(
        "Ya se registró el restaurante, ya puedes iniciar sesión con tu usuario y contraseña."
      );
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Ocurrió un error al registrar el restaurante."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {successMessage && (
        <div className="bg-green-50 border border-green-300 text-green-800 px-6 py-6 rounded-xl mb-6">
          <div className="font-bold text-lg mb-2">
            Restaurante registrado correctamente
          </div>
          <p className="text-green-700">{successMessage}</p>
          <a
            href="/login"
            className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-6 rounded-xl mb-6">
          <div className="font-bold text-lg mb-2">
            Error al Registrar el Restaurante
          </div>
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={submit} className="w-full max-w-3xl mx-auto p-4 sm:p-8 space-y-8 bg-white rounded-xl shadow">
          <div className="border-b border-orange-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Registro de Restaurante</h1>
            <p className="text-sm text-gray-500 mt-1">Completa los datos para registrar tu restaurante</p>
          </div>

          {/* Información básica */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-orange-700">Información del Restaurante</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Restaurante</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors" placeholder="Ej: Taquería El Norte"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors" placeholder="Ej: 5512345678"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors" placeholder="Ej: Calle Principal #123"
                  value={form.direccion}
                  onChange={e => setForm({ ...form, direccion: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Eslogan</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors" placeholder="Ej: Lo mejor de la comida mexicana"
                  value={form.slogan}
                  onChange={e => setForm({ ...form, slogan: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Cuenta de administrador */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-orange-700">Cuenta de Administrador</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Administrador</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors" placeholder="Ej: Juan Pérez"
                  value={form.nombreUsuario}
                  onChange={e => setForm({ ...form, nombreUsuario: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <input className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors" placeholder="Ej: juanperez"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors" placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-orange-700">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => {
                const selected = form.categoriaIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        categoriaIds: selected
                          ? form.categoriaIds.filter((x) => x !== c.id)
                          : [...form.categoriaIds, c.id],
                      })
                    }
                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium
                      ${selected
                        ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                      }`}
                  >
                    {c.nombre}
                  </button>
                );
              })}
            </div>
            {form.categoriaIds.length > 0 && (
              <div className="text-sm text-gray-500">
                {form.categoriaIds.length} seleccionada{form.categoriaIds.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Amenidades */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-orange-700">Amenidades</h2>
            <div className="flex flex-wrap gap-2">
              {amenidades.map((a) => {
                const selected = form.amenidadIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        amenidadIds: selected
                          ? form.amenidadIds.filter((x) => x !== a.id)
                          : [...form.amenidadIds, a.id],
                      })
                    }
                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium
                      ${selected
                        ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                      }`}
                  >
                    {a.nombre}
                  </button>
                );
              })}
            </div>
            {form.amenidadIds.length > 0 && (
              <div className="text-sm text-gray-500">
                {form.amenidadIds.length} seleccionada{form.amenidadIds.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Horarios */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-orange-700">Horarios</h2>
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox"
                checked={usarMismoHorario}
                onChange={e => setUsarMismoHorario(e.target.checked)}
                className="w-4 h-4 text-orange-600 accent-orange-600 rounded" />
              Aplicar mismo horario a todos los días
            </label>

            {usarMismoHorario ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Apertura</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 outline-none transition-colors"
                    value={form.horarioGeneral.apertura}
                    onChange={e => setForm({
                      ...form, horarioGeneral: {
                        ...form.horarioGeneral, apertura: e.target.value
                      }
                    })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-300 outline-none transition-colors"
                    value={form.horarioGeneral.cierre}
                    onChange={e => setForm({
                      ...form, horarioGeneral: {
                        ...form.horarioGeneral, cierre: e.target.value
                      }
                    })} />
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-w-lg">
                {form.horarios.map((h, i) => (
                  <div key={h.dia} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700">{h.dia}</span>
                    <input type="time" value={h.apertura}
                      onChange={e => {
                        const horarios = [...form.horarios];
                        horarios[i].apertura = e.target.value;
                        setForm({ ...form, horarios });
                      }}
                      className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
                    <input type="time" value={h.cierre}
                      onChange={e => {
                        const horarios = [...form.horarios];
                        horarios[i].cierre = e.target.value;
                        setForm({ ...form, horarios });
                      }}
                      className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Imágenes */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-orange-700">Imágenes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo del Restaurante</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" id="logo-upload"
                    onChange={e => setForm({ ...form, perfilImage: e.target.files?.[0] || null })}
                    className="hidden" />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    {form.perfilImage ? (
                      <img src={URL.createObjectURL(form.perfilImage)} alt="Logo" className="w-28 h-28 object-cover rounded-lg mx-auto" />
                    ) : (
                      <div className="py-6 text-gray-400">
                        <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm">Subir logo</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Portada</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" id="cover-upload"
                    onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })}
                    className="hidden" />
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    {form.image ? (
                      <img src={URL.createObjectURL(form.image)} alt="Portada" className="w-full h-28 object-cover rounded-lg" />
                    ) : (
                      <div className="py-6 text-gray-400">
                        <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm">Subir portada</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-colors"
          >
            {submitting && (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            )}
            {submitting ? "Registrando restaurante..." : "Crear Restaurante"}
          </button>
        </form>
      )}
    </>
  );
}
