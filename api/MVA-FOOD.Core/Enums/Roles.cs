namespace MVA_FOOD.Core.Enums
{
    /// <summary>
    /// Roles del sistema. Se almacenan como cadena en Usuario.Rol y se emiten
    /// como ClaimTypes.Role en el JWT para poder usar [Authorize(Roles = ...)].
    /// </summary>
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Empleado = "Empleado";
        public const string Mesero = "Mesero";
        public const string Cocina = "Cocina";

        /// <summary>Lectura de pedidos y transición de estados de items (cocina).— Todos los roles.</summary>
        public const string Pedidos = Admin + "," + Empleado + "," + Mesero + "," + Cocina;

        /// <summary>Marcar pedido como entregado (mesero).</summary>
        public const string MarcarEntregado = Admin + "," + Empleado + "," + Mesero;

        /// <summary>Avance de estados de items en cocina.</summary>
        public const string CocinaWorkflow = Admin + "," + Empleado + "," + Cocina;

        /// <summary>Cuentas de mesa y facturación (cocina no las toca).</summary>
        public const string CuentasYFacturas = Admin + "," + Empleado + "," + Mesero;

        /// <summary>
        /// Caja: imprime la cuenta, la lleva al cliente y confirma el cobro. El mesero
        /// queda fuera a propósito — él envía la cuenta, no verifica el dinero recibido.
        /// </summary>
        public const string Caja = Admin + "," + Empleado;

        /// <summary>Ver el módulo de propinas (consultar y configurar reparto).</summary>
        public const string Propinas = Admin + "," + Empleado;

        /// <summary>Marcar un rango de propinas como pagado (solo gerencia).</summary>
        public const string PagarPropinas = SoloAdmin;

        public const string SoloAdmin = Admin;
    }

    /// <summary>
    /// Catálogo de permisos por módulo del panel /admin/*. Se emiten como claims
    /// "permiso" en el JWT y se guardan en las tablas Permiso/RolPermiso.
    /// </summary>
    public static class Permisos
    {
        public const string Dashboard = "dashboard";
        public const string Menus = "menus";
        public const string Ordenes = "ordenes";
        public const string Facturacion = "facturacion";
        public const string Suscripcion = "suscripcion";
        public const string Mesero = "mesero";
        public const string Cocina = "cocina";
        public const string Mesas = "mesas";
        public const string Configuracion = "configuracion";
        public const string Usuarios = "usuarios";
        public const string Cuentas = "cuentas";
        public const string Propinas = "propinas";

        public static readonly string[] Todos =
        {
            Dashboard, Menus, Ordenes, Facturacion, Suscripcion, Mesero, Cocina, Mesas, Configuracion, Usuarios, Cuentas, Propinas
        };

        /// <summary>
        /// Permisos por defecto de cada rol (Admin tiene todos). Definición canónica
        /// usada por el seed; editar los permisos de un rol en la BD permite afinarlos.
        /// </summary>
        public static readonly IReadOnlyDictionary<string, string[]> PorRol = new Dictionary<string, string[]>
        {
            [Roles.Admin] = Todos,
            [Roles.Empleado] = new[]
            {
                Dashboard, Menus, Ordenes, Facturacion, Suscripcion, Mesero, Cocina, Mesas, Configuracion, Propinas
            },
            [Roles.Mesero] = new[] { Dashboard, Ordenes, Mesero, Mesas, Cuentas },
            [Roles.Cocina] = new[] { Dashboard, Ordenes, Cocina }
        };

        /// <summary>Roles permitidos al crear/editar un usuario desde el panel.</summary>
        public static readonly string[] RolesPermitidos = { Roles.Admin, Roles.Empleado, Roles.Mesero, Roles.Cocina };
    }
}