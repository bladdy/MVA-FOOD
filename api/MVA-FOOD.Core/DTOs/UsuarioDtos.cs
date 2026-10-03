namespace MVA_FOOD.Core.DTOs
{
    public class UsuarioDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string UsuarioNombre { get; set; } = string.Empty;
        public string Rol { get; set; } = "Empleado";
        public bool Activo { get; set; } = true;
    }

    public class CrearUsuarioDto
    {
        public string Nombre { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Rol { get; set; } = "Empleado";
    }

    public class ActualizarUsuarioDto
    {
        public string Rol { get; set; } = "Empleado";
        public bool Activo { get; set; } = true;
    }

    public class CambiarPasswordDto
    {
        public string NuevaPassword { get; set; } = null!;
    }

    public class PermisoDto
    {
        public string Clave { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string? Modulo { get; set; }
    }

    /// <summary>Permisos efectivos de un rol (usado por el panel de configuración).</summary>
    public class RolPermisosDto
    {
        public string Rol { get; set; } = string.Empty;
        public List<string> Permisos { get; set; } = new List<string>();
    }

    public class AsignarPermisosDto
    {
        public string Rol { get; set; } = null!;
        public List<string> Permisos { get; set; } = new List<string>();
    }
}