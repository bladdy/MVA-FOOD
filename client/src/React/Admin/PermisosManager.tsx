import { useEffect, useState } from "react";
import { permisoService } from "@/Services/permisoService.ts";
import type { PermisoDto, RolPermisosDto } from "@/Types/Restaurante.ts";

export default function PermisosManager() {
  const [catalogo, setCatalogo] = useState<PermisoDto[]>([]);
  const [porRol, setPorRol] = useState<RolPermisosDto[]>([]);
  const [rolActivo, setRolActivo] = useState("Empleado");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargar = async () => {
    try {
      const [cat, roles] = await Promise.all([
        permisoService.getAll(),
        permisoService.getPorRol(),
      ]);
      setCatalogo(cat);
      setPorRol(roles);
    } catch {
      setMensaje("No se pudieron cargar los permisos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const permisosDelRol = (rol: string) =>
    porRol.find((r) => r.rol === rol)?.permisos ?? [];

  const esAdmin = rolActivo === "Admin";

  const toggle = (clave: string) => {
    if (esAdmin) return;
    const actual = permisosDelRol(rolActivo);
    const nuevo = actual.includes(clave)
      ? actual.filter((c) => c !== clave)
      : [...actual, clave];
    setPorRol((prev) =>
      prev.map((r) => (r.rol === rolActivo ? { ...r, permisos: nuevo } : r))
    );
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await permisoService.asignarRol(rolActivo, permisosDelRol(rolActivo));
      setMensaje("Permisos guardados correctamente");
    } catch {
      setMensaje("No se pudieron guardar los permisos");
    } finally {
      setGuardando(false);
    }
  };

  const agrupados = catalogo.reduce<Record<string, PermisoDto[]>>((acc, p) => {
    const modulo = p.modulo ?? "Otros";
    acc[modulo] = acc[modulo] ?? [];
    acc[modulo].push(p);
    return acc;
  }, {});

  if (cargando) return <p className="text-gray-500 py-8 text-center">Cargando permisos...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Permisos por rol</h1>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Define qué módulos del panel puede ver cada rol. Los cambios aplican la próxima vez
        que cada usuario inicie sesión. El rol <b>Admin</b> siempre tiene todos los permisos.
      </p>

      {mensaje && (
        <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-700 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{mensaje}</span>
          <button onClick={() => setMensaje("")} className="font-bold">
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {porRol.map((r) => (
          <button
            key={r.rol}
            onClick={() => {
              setRolActivo(r.rol);
              setMensaje("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              rolActivo === r.rol
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {r.rol}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {esAdmin ? (
          <p className="text-sm text-gray-500">
            El rol <b>Admin</b> tiene acceso total a todos los módulos.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(agrupados).map(([modulo, permisos]) => (
              <div key={modulo}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  {modulo}
                </h3>
                <div className="space-y-2">
                  {permisos.map((p) => {
                    const activo = permisosDelRol(rolActivo).includes(p.clave);
                    return (
                      <label
                        key={p.clave}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${
                          activo ? "bg-orange-50 border-orange-200" : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={activo}
                          onChange={() => toggle(p.clave)}
                          className="accent-orange-500 h-4 w-4"
                        />
                        <span className="text-sm text-gray-700">{p.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!esAdmin && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={guardar}
            disabled={guardando}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar permisos"}
          </button>
          <button
            onClick={() => {
              cargar();
              setMensaje("");
            }}
            className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Restablecer
          </button>
        </div>
      )}
    </div>
  );
}