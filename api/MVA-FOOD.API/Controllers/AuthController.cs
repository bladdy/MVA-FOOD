using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Enums;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Services;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly TokenService _tokenService;

        public AuthController(
            IUsuarioService usuarioService,
            TokenService tokenService)
        {
            _usuarioService = usuarioService;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestDto request)
        {
            var usuario = _usuarioService.Autenticar(
                request.Username,
                request.Password);

            if (usuario == null)
                return Unauthorized("Credenciales inválidas");

            var token = _tokenService.GenerarToken(usuario);

            Response.Cookies.Append("token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //Domain = ".mr-menus.com",
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                nombre = usuario.Nombre,
                rol = usuario.Rol,
                restauranteId = usuario.RestauranteId,
                usuarioId = usuario.Id,
                activo = usuario.Activo
            });
        }

        /// <summary>
        /// Creación de usuarios del panel. Requiere autenticación de Admin; el nuevo
        /// usuario se asigna al mismo restaurante del Admin (el flujo anónimo de
        /// alta de restaurante crea al administrador vía CrearRestauranteDto).
        /// </summary>
        [HttpPost("register")]
        [Authorize(Roles = Roles.SoloAdmin)]
        public IActionResult Register([FromBody] RegisterRequestDto request)
        {
            if (!Permisos.RolesPermitidos.Contains(request.Rol))
                return BadRequest(new { mensaje = "Rol no permitido" });

            var restauranteId = Guid.TryParse(User.FindFirstValue("restauranteId"), out var rid)
                ? (Guid?)rid
                : null;
            if (!restauranteId.HasValue)
                return Unauthorized(new { mensaje = "Restaurante no determinado" });

            if (_usuarioService.ObtenerPorUsuario(request.Username) != null)
                return BadRequest("El usuario ya existe");

            var nuevoUsuario = new Usuario
            {
                Nombre = request.Nombre,
                UsuarioNombre = request.Username,
                Rol = request.Rol,
                RestauranteId = restauranteId,
                Activo = true
            };

            var usuarioCreado = _usuarioService.Crear(
                nuevoUsuario,
                request.Password);

            return Ok(new UsuarioDto
            {
                Id = usuarioCreado.Id,
                Nombre = usuarioCreado.Nombre,
                UsuarioNombre = usuarioCreado.UsuarioNombre,
                Rol = usuarioCreado.Rol,
                Activo = usuarioCreado.Activo
            });
        }

        [HttpGet("validate-token")]
        public IActionResult ValidateToken([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return Unauthorized("Token no proporcionado");

            var isValid = _tokenService.ValidarToken(token);

            if (!isValid)
                return Unauthorized("Token inválido");

            return Ok("Token válido");
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var tokenAntes = Request.Cookies["token"];
            Response.Cookies.Append("token", "", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //Domain = ".mr-menus.com",
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(-1)
            });

            return Ok(new
            {
                message = "Logged out successfully"
            });
        }

        [HttpGet("get-current-user")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            var token = Request.Cookies["token"];

            if (string.IsNullOrEmpty(token))
                return Unauthorized("Token no encontrado");

            var usuarioId = User.Claims
                .FirstOrDefault(c => c.Type == "usuarioId")
                ?.Value;

            var nombre = User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Name)
                ?.Value;

            var rol = User.Claims
                .FirstOrDefault(c => c.Type == "rol")
                ?.Value;

            var restauranteId = User.Claims
                .FirstOrDefault(c => c.Type == "restauranteId")
                ?.Value;

            var permisos = User.Claims
                .Where(c => c.Type == "permiso")
                .Select(c => c.Value)
                .ToList();

            var activo = User.Claims
                .FirstOrDefault(c => c.Type == "activo")
                ?.Value;

            return Ok(new
            {
                usuarioId,
                nombre,
                rol,
                restauranteId,
                permisos,
                activo
            });
        }
    }
}