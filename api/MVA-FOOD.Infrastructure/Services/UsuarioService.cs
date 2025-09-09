

using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    // Services/UsuarioService.cs
    public class UsuarioService : IUsuarioService
    {
        private readonly AppDbContext _context;

        public UsuarioService(AppDbContext context)
        {
            _context = context;
        }

        public Usuario Autenticar(string username, string password)
        {
            var user = _context.Usuarios.FirstOrDefault(u => u.UsuarioNombre == username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;
            return user;
        }

        public Usuario Crear(Usuario usuario, string password)
        {
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            _context.Usuarios.Add(usuario);
            _context.SaveChanges();
            return usuario;
        }

        public Task<Usuario> GetCurrentUser(ClaimsPrincipal user)
        {
            if (user == null) return Task.FromResult<Usuario>(null);

            // Extraer claims desde el JWT (sin Identity)
            var usuarioId = user.Claims.FirstOrDefault(c => c.Type == "usuarioId")?.Value;
            var nombre = user.Claims.FirstOrDefault(c => c.Type == "nombre")?.Value;
            var rol = user.Claims.FirstOrDefault(c => c.Type == "rol")?.Value;
            var restauranteId = user.Claims.FirstOrDefault(c => c.Type == "restauranteId")?.Value;
            var usuarioNombre = user.Claims.FirstOrDefault(c => c.Type == "username")?.Value;

            if (string.IsNullOrEmpty(usuarioId)) return Task.FromResult<Usuario>(null);

            return Task.FromResult(new Usuario
            {
                Id = Guid.Parse(usuarioId),
                Nombre = nombre,
                Rol = rol,
                RestauranteId = Guid.Parse(restauranteId), // puede ser null
                UsuarioNombre = usuarioNombre
            });
        }

        public Usuario ObtenerPorUsuario(string username) =>
            _context.Usuarios.FirstOrDefault(u => u.UsuarioNombre == username);
    }

}