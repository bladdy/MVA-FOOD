import { useEffect, useState } from "react";
import { usuarioService } from "@/Services/usuarioService.ts";
import type { UsuarioDto } from "@/Types/Restaurante.ts";

const ROLES_PERMITIDOS = ["Admin", "Empleado", "Mesero", "Cocina"];

export default function UsuariosManager() {
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", username: "", password: "", rol: "Empleado" });
  const [passwordModal, setPasswordModal] = useState<UsuarioDto | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");

  const cargar = async () => {
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
      setError("");
    } catch (e) {
      setError("No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCrear = async () => {
    try {
      await usuarioService.crear({
        nombre: form.nombre.trim(),
        username: form.username.trim(),
        password: form.password,
        rol: form.rol,
      });
      setShowForm(false);
      setForm({ nombre: "", username: "", password: "", rol: "Empleado" });
      cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el usuario");
    }
  };

  const handleToggleActivo = async (u: UsuarioDto) => {
    await usuarioService.actualizar(u.id, { rol: u.rol, activo: !u.activo });
    cargar();
  };

  const handleCambioRol = async (u: UsuarioDto, rol: string) => {
    await usuarioService.actualizar(u.id, { rol, activo: u.activo });
    cargar();
  };

  const handleCambiarPassword = async () => {
    if (!passwordModal) return;
    try {
      await usuarioService.cambiarPassword(passwordModal.id, nuevaPassword);
      setPasswordModal(null);
      setNuevaPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar la contraseña");
    }
  };

  if (cargando) return <p className="text-gray-500 py-8 text-center">Cargando usuarios...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {showForm ? "Cancelar" : "+ Nuevo usuario"}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError("")} className="float-right font-bold">
            ✕
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Nuevo usuario</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre completo"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Usuario (ej. juan)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Contraseña (mín. 6 caracteres)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {ROLES_PERMITIDOS.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCrear}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Crear usuario
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-6">
        Gestiona el acceso al panel. Los roles se combinan con los permisos configurados en
        <a href="/admin/configuracion/permisos" className="text-orange-600 font-medium ml-1">Permisos</a>.
      </p>

      {usuarios.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay usuarios</p>
      ) : (
        <div className="grid gap-4">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className={`border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                u.activo ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-gray-800">{u.nombre}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">@{u.usuarioNombre} · Rol: {u.rol}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={u.rol}
                  onChange={(e) => handleCambioRol(u, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none"
                >
                  {ROLES_PERMITIDOS.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setPasswordModal(u)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Contraseña
                </button>
                <button
                  onClick={() => handleToggleActivo(u)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    u.activo ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {passwordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setPasswordModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cambiar contraseña</h3>
            <p className="text-sm text-gray-500 mb-4">@{passwordModal.usuarioNombre}</p>
            <input
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCambiarPassword}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Guardar
              </button>
              <button
                onClick={() => setPasswordModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}