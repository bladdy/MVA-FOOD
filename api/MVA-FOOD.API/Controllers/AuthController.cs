using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Services;

namespace MVA_FOOD.API.Controllers
{
    // Controllers/AuthController.cs
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly TokenService _tokenService;

        public AuthController(IUsuarioService usuarioService, TokenService tokenService)
        {
            _usuarioService = usuarioService;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestDto request)
        {
            var usuario = _usuarioService.Autenticar(request.Username, request.Password);
            if (usuario == null)
                return Unauthorized("Credenciales inválidas");

            var token = _tokenService.GenerarToken(usuario);
            Response.Cookies.Append("token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Path = "/"
            });
            return Ok(new
            {
                token,
                nombre = usuario.Nombre,
                rol = usuario.Rol,
                restauranteId = usuario.RestauranteId, // <- agregamos aquí
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
                RestauranteId = null  // ← MUY IMPORTANTE
            };

            var usuarioCreado = _usuarioService.Crear(nuevoUsuario, request.Password);
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
            // Eliminar la cookie del token
            if (Request.Cookies.ContainsKey("token"))
            {
                Response.Cookies.Delete("token", new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Path = "/"
                });
            }

            return Ok(new { message = "Logged out successfully" });
        }
        [HttpGet("get-current-user")]
        [Authorize]
        public IActionResult getCurrentUser()
        {
            /*var request = await _usuarioService.GetCurrentUser(User);
            Console.Write("USUARIO:" +User.Claims);
            if (request == null) return Unauthorized("Usuario no autenticado");
            return Ok(request);*/

            var usuarioId = User.Claims.FirstOrDefault(c => c.Type == "usuarioId")?.Value;
            var nombre = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            var rol = User.Claims.FirstOrDefault(c => c.Type == "rol")?.Value;
            var restauranteId = User.Claims.FirstOrDefault(c => c.Type == "restauranteId")?.Value;

            return Ok(new { usuarioId, nombre, rol, restauranteId });
        }

    }

}