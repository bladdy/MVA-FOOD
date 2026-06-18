
import { useEffect, useState } from "react";
import { createRestaurante } from "@/Services/restauranteService";
import { menuService } from "@/Services/menuService";

type Props = { planId: string };

const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function RestaurantRegistrationForm({ planId }: Props) {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [amenidades, setAmenidades] = useState<any[]>([]);
  const [usarMismoHorario, setUsarMismoHorario] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
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

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-6 py-4 rounded-lg mb-6">
          <div className="font-semibold mb-2">
            Restaurante registrado correctamente
          </div>

          <p>{successMessage}</p>

          <a
            href="/login"
            className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Iniciar Sesión
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-6 py-4 rounded-lg mb-6">
          <div className="font-semibold mb-2">
            Error al Registrar el Restaurante
          </div>

          <p>{errorMessage}</p>
        </div>
      )}


      {!successMessage && (
        <form onSubmit={submit} className="max-w-7xl mx-auto p-8 space-y-8 bg-white rounded-xl shadow">
          <h1 className="text-3xl font-bold">Registro de Restaurante</h1>

          <div className="grid md:grid-cols-2 gap-6">
            <input className="border p-3 rounded" placeholder="Nombre"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })} />

            <input className="border p-3 rounded" placeholder="Teléfono"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })} />

            <input className="border p-3 rounded md:col-span-2" placeholder="Dirección"
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <input className="border p-3 rounded" placeholder="Nombre Administrador"
              value={form.nombreUsuario}
              onChange={e => setForm({ ...form, nombreUsuario: e.target.value })} />

            <input className="border p-3 rounded" placeholder="Usuario"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} />

            <input type="password" className="border p-3 rounded" placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          <div>
            <h2 className="font-semibold mb-3">Categorías</h2>
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
                    className={`px-4 py-2 rounded-lg border transition-all
                      ${selected
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-500"
                      }`}
                  >
                    {c.nombre}
                  </button>
                );
              })}
            </div>
            {form.categoriaIds.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Seleccionadas: {form.categoriaIds.length}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold mb-3">Amenidades</h2>
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
                    className={`px-4 py-2 rounded-lg border transition-all
                      ${selected
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                      }`}
                  >
                    {a.nombre}
                  </button>
                );
              })}
            </div>
            {form.amenidadIds.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Seleccionadas: {form.amenidadIds.length}
              </div>
            )}
          </div>

          <div>
            <label className="flex gap-2 mb-4">
              <input type="checkbox"
                checked={usarMismoHorario}
                onChange={e => setUsarMismoHorario(e.target.checked)} />
              Aplicar mismo horario a todos los días
            </label>

            {usarMismoHorario ? (
              <div className="grid md:grid-cols-2 gap-4">
                <input type="time" className="border p-3 rounded"
                  value={form.horarioGeneral.apertura}
                  onChange={e => setForm({
                    ...form, horarioGeneral: {
                      ...form.horarioGeneral, apertura: e.target.value
                    }
                  })} />

                <input type="time" className="border p-3 rounded"
                  value={form.horarioGeneral.cierre}
                  onChange={e => setForm({
                    ...form, horarioGeneral: {
                      ...form.horarioGeneral, cierre: e.target.value
                    }
                  })} />
              </div>
            ) : (
              <div className="space-y-2">
                {form.horarios.map((h, i) => (
                  <div key={h.dia} className="grid grid-cols-3 gap-2">
                    <div>{h.dia}</div>
                    <input type="time" value={h.apertura}
                      onChange={e => {
                        const horarios = [...form.horarios];
                        horarios[i].apertura = e.target.value;
                        setForm({ ...form, horarios });
                      }} />
                    <input type="time" value={h.cierre}
                      onChange={e => {
                        const horarios = [...form.horarios];
                        horarios[i].cierre = e.target.value;
                        setForm({ ...form, horarios });
                      }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <input type="file" accept="image/*"
              onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })} />
            {form.image && (
              <img
                src={URL.createObjectURL(form.image)}
                alt="Logo"
                className="w-32 h-32 object-cover rounded-lg mt-2"
              />
            )}

            <input type="file" accept="image/*"
              onChange={e => setForm({ ...form, perfilImage: e.target.files?.[0] || null })} />
            {form.perfilImage && (
              <img
                src={URL.createObjectURL(form.perfilImage)}
                alt="Portada"
                className="w-full max-h-48 object-cover rounded-lg mt-2"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded"
          >
            {loading ? "Registrando restaurante..." : "Crear Restaurante"}
          </button>
        </form>
      )}

    </>
  );
}
