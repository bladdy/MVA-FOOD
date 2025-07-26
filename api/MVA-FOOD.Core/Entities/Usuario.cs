using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Usuario
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string UsuarioNombre { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Rol { get; set; } = "Admin"; // Admin, Empleado, etc.
        // Relación con Restaurante
        public Guid? RestauranteId { get; set; }  // Nullable ← ✅ IMPORTANTE

        #nullable enable
        public Restaurante? Restaurante { get; set; }  // ← También nullable
    }
}