

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

        public Usuario ObtenerPorUsuario(string username) =>
            _context.Usuarios.FirstOrDefault(u => u.UsuarioNombre == username);
    }

}