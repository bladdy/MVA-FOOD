using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Enums;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.SoloAdmin)]
    public class PermisoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PermisoController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>Catálogo de permisos disponibles.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var permisos = await _context.Permisos
                .AsNoTracking()
                .OrderBy(p => p.Modulo).ThenBy(p => p.Nombre)
                .Select(p => new
                {
                    p.Clave,
                    p.Nombre,
                    p.Modulo
                })
                .ToListAsync();

            return Ok(permisos);
        }

        /// <summary>Permisos configurados de cada rol.</summary>
        [HttpGet("roles")]
        public async Task<IActionResult> GetPorRol()
        {
            var asignados = await _context.RolPermisos
                .AsNoTracking()
                .ToListAsync();

            var porRol = Permisos.PorRol.ToDictionary(
                kv => kv.Key,
                kv => asignados.Any(a => a.Rol == kv.Key)
                    ? asignados.Where(a => a.Rol == kv.Key).Select(a => a.PermisoClave).Distinct().ToList()
                    : kv.Value.ToList());

            var resultado = porRol.Select(kv => new RolPermisosDto
            {
                Rol = kv.Key,
                Permisos = kv.Value
            }).ToList();

            return Ok(resultado);
        }

        /// <summary>Asigna los permisos de un rol (reemplaza la configuración actual).</summary>
        [HttpPut("roles")]
        public async Task<IActionResult> AsignarRol(AsignarPermisosDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Rol) || !Permisos.PorRol.ContainsKey(dto.Rol))
                return BadRequest(new { mensaje = "Rol no válido" });

            var validas = new HashSet<string>(Permisos.Todos);
            var claves = dto.Permisos?.Where(p => validas.Contains(p)).Distinct().ToList() ?? new List<string>();
            if (dto.Rol == Roles.Admin)
                claves = Permisos.Todos.ToList();

            var existentes = await _context.RolPermisos
                .Where(rp => rp.Rol == dto.Rol)
                .ToListAsync();
            _context.RolPermisos.RemoveRange(existentes);

            _context.RolPermisos.AddRange(claves.Select(clave => new RolPermiso
            {
                Rol = dto.Rol,
                PermisoClave = clave
            }));

            await _context.SaveChangesAsync();
            return Ok(new RolPermisosDto { Rol = dto.Rol, Permisos = claves });
        }
    }
}