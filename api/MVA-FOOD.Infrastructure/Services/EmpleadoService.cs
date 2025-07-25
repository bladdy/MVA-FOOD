using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class EmpleadoService : IEmpleadoService
    {
        private readonly AppDbContext _context;

        public EmpleadoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmpleadoDto>> GetAllAsync()
        {
            return await _context.Empleados
                .Include(e => e.Restaurante)
                .Select(e => new EmpleadoDto
                {
                    Id = e.Id,
                    RestauranteId = e.RestauranteId,
                    RestauranteNombre = e.Restaurante.Name,
                    Nombre = e.Nombre,
                    Cargo = e.Cargo,
                    Telefono = e.Telefono,
                    Correo = e.Correo,
                    Activo = e.Activo
                }).ToListAsync();
        }

        public async Task<EmpleadoDto> GetByIdAsync(Guid id)
        {
            var empleado = await _context.Empleados.Include(e => e.Restaurante).FirstOrDefaultAsync(e => e.Id == id);
            if (empleado == null) return null;

            return new EmpleadoDto
            {
                Id = empleado.Id,
                RestauranteId = empleado.RestauranteId,
                RestauranteNombre = empleado.Restaurante.Name,
                Nombre = empleado.Nombre,
                Cargo = empleado.Cargo,
                Telefono = empleado.Telefono,
                Correo = empleado.Correo,
                Activo = empleado.Activo
            };
        }

        public async Task<EmpleadoDto> CreateAsync(EmpleadoCreateDto dto)
        {
            var empleado = new Empleado
            {
                RestauranteId = dto.RestauranteId,
                Nombre = dto.Nombre,
                Cargo = dto.Cargo,
                Telefono = dto.Telefono,
                Correo = dto.Correo,
                Activo = true
            };

            _context.Empleados.Add(empleado);
            await _context.SaveChangesAsync();

            var restaurante = await _context.Restaurantes.FindAsync(dto.RestauranteId);

            return new EmpleadoDto
            {
                Id = empleado.Id,
                RestauranteId = empleado.RestauranteId,
                RestauranteNombre = restaurante?.Name ?? "",
                Nombre = empleado.Nombre,
                Cargo = empleado.Cargo,
                Telefono = empleado.Telefono,
                Correo = empleado.Correo,
                Activo = empleado.Activo
            };
        }

        public async Task<bool> UpdateAsync(Guid id, EmpleadoUpdateDto dto)
        {
            var empleado = await _context.Empleados.FindAsync(id);
            if (empleado == null) return false;

            empleado.Nombre = dto.Nombre;
            empleado.Cargo = dto.Cargo;
            empleado.Telefono = dto.Telefono;
            empleado.Correo = dto.Correo;
            empleado.Activo = dto.Activo;

            _context.Empleados.Update(empleado);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var empleado = await _context.Empleados.FindAsync(id);
            if (empleado == null) return false;

            _context.Empleados.Remove(empleado);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
