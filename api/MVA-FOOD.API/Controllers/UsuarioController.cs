using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Enums;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.SoloAdmin)]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        private Guid? RestauranteId() =>
            Guid.TryParse(User.FindFirstValue("restauranteId"), out var id) ? id : (Guid?)null;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rid = RestauranteId();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "Restaurante no determinado" });

            var usuarios = await _usuarioService.GetAllByRestauranteAsync(rid.Value);
            return Ok(usuarios.Select(u => new UsuarioDto
            {
                Id = u.Id,
                Nombre = u.Nombre,
                UsuarioNombre = u.UsuarioNombre,
                Rol = u.Rol,
                Activo = u.Activo
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Crear(CrearUsuarioDto dto)
        {
            var rid = RestauranteId();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "Restaurante no determinado" });

            if (string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Username)
                || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { mensaje = "Nombre, usuario y contraseña son requeridos" });

            if (dto.Password.Length < 6)
                return BadRequest(new { mensaje = "La contraseña debe tener al menos 6 caracteres" });

            if (!Permisos.RolesPermitidos.Contains(dto.Rol))
                return BadRequest(new { mensaje = "Rol no permitido" });

            if (_usuarioService.ObtenerPorUsuario(dto.Username) != null)
                return BadRequest(new { mensaje = "El nombre de usuario ya existe" });

            var nuevo = new Usuario
            {
                Nombre = dto.Nombre.Trim(),
                UsuarioNombre = dto.Username.Trim(),
                Rol = dto.Rol,
                RestauranteId = rid,
                Activo = true
            };

            var creado = _usuarioService.Crear(nuevo, dto.Password);
            return Ok(new UsuarioDto
            {
                Id = creado.Id,
                Nombre = creado.Nombre,
                UsuarioNombre = creado.UsuarioNombre,
                Rol = creado.Rol,
                Activo = creado.Activo
            });
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Actualizar(Guid id, ActualizarUsuarioDto dto)
        {
            var rid = RestauranteId();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "Restaurante no determinado" });

            if (!Permisos.RolesPermitidos.Contains(dto.Rol))
                return BadRequest(new { mensaje = "Rol no permitido" });

            var ok = await _usuarioService.ActualizarAsync(id, rid.Value, dto.Rol, dto.Activo);
            if (!ok) return NotFound(new { mensaje = "Usuario no encontrado" });

            return NoContent();
        }

        [HttpPatch("{id}/password")]
        public async Task<IActionResult> CambiarPassword(Guid id, CambiarPasswordDto dto)
        {
            var rid = RestauranteId();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "Restaurante no determinado" });

            if (string.IsNullOrWhiteSpace(dto.NuevaPassword) || dto.NuevaPassword.Length < 6)
                return BadRequest(new { mensaje = "La contraseña debe tener al menos 6 caracteres" });

            var ok = await _usuarioService.CambiarPasswordAsync(id, rid.Value, dto.NuevaPassword);
            if (!ok) return NotFound(new { mensaje = "Usuario no encontrado" });

            return NoContent();
        }
    }
}