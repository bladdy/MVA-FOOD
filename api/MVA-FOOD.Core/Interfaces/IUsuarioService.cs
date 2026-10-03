using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IUsuarioService
    {
        Usuario Autenticar(string username, string password);
        Usuario Crear(Usuario usuario, string password);
        Usuario ObtenerPorUsuario(string username);
        Task<Usuario> GetCurrentUser(ClaimsPrincipal user);
        Task<List<Usuario>> GetAllByRestauranteAsync(Guid restauranteId);
        Task<Usuario> GetByIdAsync(Guid id);
        Task<bool> ActualizarAsync(Guid id, Guid restauranteId, string rol, bool activo);
        Task<bool> CambiarPasswordAsync(Guid id, Guid restauranteId, string nuevaPassword);
    }
}