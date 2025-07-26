using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
            return Ok(new
            {
                token,
                nombre = usuario.Nombre,
                rol = usuario.Rol,
                restauranteId = usuario.RestauranteId // <- agregamos aquí
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
    }

}