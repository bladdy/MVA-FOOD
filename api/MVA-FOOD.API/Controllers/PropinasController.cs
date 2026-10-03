using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Enums;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Propinas)]
    public class PropinasController : ControllerBase
    {
        private readonly IPropinaService _service;

        public PropinasController(IPropinaService service)
        {
            _service = service;
        }

        private Guid? ResolverRestauranteDeUsuario()
        {
            var value = User.FindFirstValue("restauranteId");
            return Guid.TryParse(value, out var id) ? id : null;
        }

        private bool PuedeAcceder(Guid restauranteId)
        {
            var userRestauranteId = User.FindFirstValue("restauranteId");
            return !string.IsNullOrEmpty(userRestauranteId) && userRestauranteId == restauranteId.ToString();
        }

        [HttpGet("config")]
        public async Task<IActionResult> GetConfig(Guid? restauranteId)
        {
            var rid = restauranteId ?? ResolverRestauranteDeUsuario();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "No se pudo determinar el restaurante" });
            if (!PuedeAcceder(rid.Value)) return Forbid();
            try
            {
                return Ok(await _service.ObtenerConfigAsync(rid.Value));
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { codigo = ex.Code, mensaje = ex.Message });
            }
        }

        [HttpPut("config")]
        [Authorize(Roles = Roles.PagarPropinas)]
        public async Task<IActionResult> PutConfig([FromQuery] Guid? restauranteId, ConfigPropinaDto dto)
        {
            var rid = restauranteId ?? ResolverRestauranteDeUsuario();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "No se pudo determinar el restaurante" });
            if (!PuedeAcceder(rid.Value)) return Forbid();
            try
            {
                return Ok(await _service.GuardarConfigAsync(rid.Value, dto));
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { codigo = ex.Code, mensaje = ex.Message });
            }
        }

        [HttpGet("resumen")]
        public async Task<IActionResult> GetResumen([FromQuery] Guid? restauranteId, [FromQuery] DateTime desde, [FromQuery] DateTime hasta)
        {
            var rid = restauranteId ?? ResolverRestauranteDeUsuario();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "No se pudo determinar el restaurante" });
            if (!PuedeAcceder(rid.Value)) return Forbid();
            try
            {
                return Ok(await _service.ObtenerResumenAsync(rid.Value, desde, hasta));
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { codigo = ex.Code, mensaje = ex.Message });
            }
        }

        [HttpPost("pagar")]
        [Authorize(Roles = Roles.PagarPropinas)]
        public async Task<IActionResult> Pagar([FromQuery] Guid? restauranteId, PagarPropinaDto dto)
        {
            var rid = restauranteId ?? ResolverRestauranteDeUsuario();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "No se pudo determinar el restaurante" });
            if (!PuedeAcceder(rid.Value)) return Forbid();

            var userId = User.FindFirstValue("usuarioId");
            if (!Guid.TryParse(userId, out var uid))
                return Unauthorized(new { mensaje = "Usuario inválido" });
            var nombre = User.Identity?.Name;

            try
            {
                return Ok(await _service.PagarAsync(rid.Value, dto, uid, nombre));
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { codigo = ex.Code, mensaje = ex.Message });
            }
        }

        [HttpGet("historial")]
        public async Task<IActionResult> GetHistorial([FromQuery] Guid? restauranteId)
        {
            var rid = restauranteId ?? ResolverRestauranteDeUsuario();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "No se pudo determinar el restaurante" });
            if (!PuedeAcceder(rid.Value)) return Forbid();
            return Ok(await _service.ObtenerHistorialAsync(rid.Value));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var rid = ResolverRestauranteDeUsuario();
            if (!rid.HasValue) return Unauthorized();
            var pago = await _service.ObtenerDetalleAsync(id, rid.Value);
            if (pago == null) return NotFound();
            return Ok(pago);
        }
    }
}