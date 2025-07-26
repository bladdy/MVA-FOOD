using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class RegisterRequestDto
    {
        public string Nombre { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Rol { get; set; } = "Admin"; // Admin, Empleado, etc.
        //public Guid RestauranteId { get; set; }
    }
}