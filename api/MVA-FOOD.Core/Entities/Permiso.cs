namespace MVA_FOOD.Core.Entities
{
    /// <summary>
    /// Permisos por módulo del panel /admin/*. Catálogo global (no por restaurante).
    /// </summary>
    public class Permiso
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Clave { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Modulo { get; set; }
    }

    /// <summary>
    /// Asignación de permisos a cada rol. La combinación (Rol, PermisoClave) es única.
    /// </summary>
    public class RolPermiso
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Rol { get; set; } = null!;
        public string PermisoClave { get; set; } = null!;
    }
}