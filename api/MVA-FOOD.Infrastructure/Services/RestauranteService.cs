using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Enums;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;
using MVA_FOOD.Infrastructure.Helpers;

namespace MVA_FOOD.Infrastructure.Services
{
    public class RestauranteService : IRestauranteService
    {
        private readonly AppDbContext _context;

        public RestauranteService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RestauranteDto>> GetAllAsync()
        {
            return await _context.Restaurantes
                .Select(r => new RestauranteDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Image = r.Image,
                    PerfilImage = r.PerfilImage,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    PlanId = r.PlanRestauranteId
                }).ToListAsync();
        }

        public async Task<RestauranteDto> GetByIdAsync(Guid id)
        {
            var r = await _context.Restaurantes.FindAsync(id);
            if (r == null) return null;

            return new RestauranteDto
            {
                Id = r.Id,
                Name = r.Name,
                Image = r.Image,
                PerfilImage = r.PerfilImage,
                Direccion = r.Direccion,
                Phone = r.Phone,
                PlanId = r.PlanRestauranteId
            };
        }

        public async Task<RestauranteDto> CreateAsync(CrearRestauranteDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // crear el restaurante
                var restaurante = new Restaurante
                {
                    Name = dto.Nombre,
                    Direccion = dto.Direccion,
                    Phone = dto.Telefono,
                    Image = dto.Image != null ? await ImagenesHelpers.GuardarImagenAsync(dto.Image, Imagenes.Background.ToString()) : null!,
                    PerfilImage = dto.PerfilImage != null ? await ImagenesHelpers.GuardarImagenAsync(dto.PerfilImage, Imagenes.Profile.ToString()) : null!,
                    PlanRestauranteId = dto.PlanId
                };

                _context.Restaurantes.Add(restaurante);
                await _context.SaveChangesAsync();

                // buscar el plan
                var plan = await _context.Planes.FindAsync(dto.PlanId);
                if (plan == null)
                    throw new ArgumentException("El plan especificado no existe.");

                var fechaInicio = DateTime.UtcNow;
                var fechaFin = fechaInicio.AddMonths(1);

                var planRestaurante = new PlanRestaurante
                {
                    RestauranteId = restaurante.Id,
                    PlanId = plan.Id,
                    FechaInicio = fechaInicio,
                    FechaFin = fechaFin,
                    Pagado = false
                };

                _context.PlanesRestaurantes.Add(planRestaurante);

                // asignar el usuario al restaurante
                var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
                if (usuario == null)
                    throw new ArgumentException("El usuario especificado no existe.");

                usuario.RestauranteId = restaurante.Id;

                await _context.SaveChangesAsync();

                // ✅ confirmar transacción
                await transaction.CommitAsync();

                return new RestauranteDto
                {
                    Id = restaurante.Id,
                    Name = restaurante.Name,
                    Image = restaurante.Image,
                    PerfilImage = restaurante.PerfilImage,
                    Direccion = restaurante.Direccion,
                    Phone = restaurante.Phone,
                    PlanId = dto.PlanId
                };
            }
            catch (DbUpdateException)
            {
                await transaction.RollbackAsync();

                throw;

            }
            finally
            {
                await transaction.DisposeAsync();
            }

        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var r = await _context.Restaurantes.FindAsync(id);
            if (r == null) return false;

            _context.Restaurantes.Remove(r);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}