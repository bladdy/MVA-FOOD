using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
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
                SameSite = SameSiteMode.Strict,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Ok(new
            {
                nombre = usuario.Nombre,
                rol = usuario.Rol,
                restauranteId = usuario.RestauranteId,
                usuarioId = usuario.Id
            });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequestDto request)
        {
            if (_usuarioService.ObtenerPorUsuario(request.Username) != null)
                return BadRequest("El usuario ya existe");

            var nuevoUsuario = new Usuario
            {
                Nombre = request.Nombre,
                UsuarioNombre = request.Username,
                Rol = request.Rol,
                RestauranteId = null
            };

            var usuarioCreado = _usuarioService.Crear(
                nuevoUsuario,
                request.Password);

            return Ok(usuarioCreado);
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

            Console.WriteLine($"TOKEN ANTES DE BORRAR: {tokenAntes}");

            Response.Cookies.Append("token", "", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddYears(-1)
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

            return Ok(new
            {
                usuarioId,
                nombre,
                rol,
                restauranteId
            });
        }
    }
}