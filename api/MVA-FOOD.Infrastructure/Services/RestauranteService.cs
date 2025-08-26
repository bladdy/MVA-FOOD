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
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Core.Wrappers;
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
        public async Task<PagedResult<RestauranteDto>> GetAllAsync(RestauranteFilter filter)
        {
            var query = _context.Restaurantes
                .Include(r => r.PlanRestaurante)
                    .ThenInclude(pr => pr.Plan)
                .Include(r => r.Menu)
                .Include(r => r.Horario)
                .Include(r => r.AmenidadRestaurantes)
                    .ThenInclude(ar => ar.Amenidad)
                .Include(r => r.CategoriaRestaurantes)
                    .ThenInclude(cr => cr.Categoria)
                .AsQueryable();

            // ✅ Filtros dinámicos (ignorar mayúsculas/minúsculas)
            if (!string.IsNullOrEmpty(filter.Search))
            {
                var search = filter.Search.ToLower();

                query = query.Where(r =>
                    r.Name.ToLower().Contains(search) ||
                    r.Direccion.ToLower().Contains(search) ||
                    r.CategoriaRestaurantes.Any(c => c.Categoria.Nombre.ToLower().Contains(search))
                );
            }

            if (filter.TipoId.HasValue)
            {
                query = query.Where(r => r.PlanRestaurante.PlanId == filter.TipoId.Value);
            }

            if (filter.AmenidadId.HasValue)
            {
                query = query.Where(r => r.AmenidadRestaurantes.Any(a => a.AmenidadId == filter.AmenidadId.Value));
            }

            if (!string.IsNullOrEmpty(filter.Ubicacion))
            {
                query = query.Where(r => r.Direccion.Contains(filter.Ubicacion));
            }

            // ✅ Ordenamiento dinámico
            query = filter.OrderBy?.ToLower() switch
            {
                "nombre" => filter.OrderDirection == "desc"
                    ? query.OrderByDescending(r => r.Name)
                    : query.OrderBy(r => r.Name),

                "tipo" => filter.OrderDirection == "desc"
                    ? query.OrderByDescending(r => r.PlanRestaurante.Plan.Nombre)
                    : query.OrderBy(r => r.PlanRestaurante.Plan.Nombre),

                "categorias" => filter.OrderDirection == "desc"
                    ? query.OrderByDescending(r => r.CategoriaRestaurantes.FirstOrDefault().Categoria.Nombre)
                    : query.OrderBy(r => r.CategoriaRestaurantes.FirstOrDefault().Categoria.Nombre),

                _ => query.OrderBy(r => r.Name) // Default
            };

            // ✅ Paginación
            var totalItems = await query.CountAsync();

            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(r => new RestauranteDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Image = r.Image,
                    PerfilImage = r.PerfilImage,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    PlanId = r.PlanRestauranteId,
                    PlanRestauranteDto = new PlanRestauranteDto
                    {
                        Id = r.PlanRestaurante.Id,
                        Nombre = r.PlanRestaurante.Plan.Nombre,
                        Precio = r.PlanRestaurante.Plan.Precio,
                        FechaInicio = r.PlanRestaurante.FechaInicio,
                        FechaFin = r.PlanRestaurante.FechaFin,
                        FechaPago = r.PlanRestaurante.FechaPago,
                        Pagado = r.PlanRestaurante.Pagado
                    },
                    Amenidades = r.AmenidadRestaurantes.Select(a => new AmenidadDto
                    {
                        Id = a.Amenidad.Id,
                        Nombre = a.Amenidad.Nombre
                    }).ToList(),
                    Categorias = r.CategoriaRestaurantes.Select(c => new CategoriaDto
                    {
                        Id = c.Categoria.Id,
                        Nombre = c.Categoria.Nombre,
                    }).ToList()
                })
                .ToListAsync();

            return new PagedResult<RestauranteDto>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize)
            };
        }



        public async Task<IEnumerable<RestauranteDto>> GetAllAsync()
        {
            return await _context.Restaurantes
                .Include(r => r.PlanRestaurante)
                .Include(r => r.Menu)
                .Include(r => r.Horario)
                .Include(r => r.AmenidadRestaurantes)
                .Include(r => r.CategoriaRestaurantes)
                //.Include(r => r.Pedidos)
                .Select(r => new RestauranteDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Image = r.Image,
                    PerfilImage = r.PerfilImage,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    PlanId = r.PlanRestauranteId,
                    PlanRestauranteDto = new PlanRestauranteDto
                    {
                        Id = r.PlanRestaurante.Id,
                        Nombre = r.PlanRestaurante.Plan.Nombre,
                        Precio = r.PlanRestaurante.Plan.Precio,
                        FechaInicio = r.PlanRestaurante.FechaInicio,
                        FechaFin = r.PlanRestaurante.FechaFin,
                        FechaPago = r.PlanRestaurante.FechaPago,
                        Pagado = r.PlanRestaurante.Pagado
                    },
                    Amenidades = r.AmenidadRestaurantes.Select(a => new AmenidadDto
                    {
                        Id = a.Id,
                        Nombre = a.Amenidad.Nombre
                    }).Where(a => a.Id != Guid.Empty).ToList(),
                    Categorias = r.CategoriaRestaurantes.Select(c => new CategoriaDto
                    {
                        Id = c.Categoria.Id,
                        Nombre = c.Categoria.Nombre,

                    }).Where(c => c.Id != Guid.Empty).ToList()
                }).ToListAsync();
        }

        public async Task<RestauranteDto> GetByIdAsync(Guid id)
        {
            return await _context.Restaurantes
                .Include(r => r.PlanRestaurante)
                .Include(r => r.Menu)
                .Include(r => r.Horario)
                .Include(r => r.AmenidadRestaurantes)
                .Include(r => r.CategoriaRestaurantes)
                .Select(r => new RestauranteDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Image = r.Image,
                    PerfilImage = r.PerfilImage,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    PlanId = r.PlanRestauranteId,
                    PlanRestauranteDto = new PlanRestauranteDto
                    {
                        Id = r.PlanRestaurante.Id,
                        Nombre = r.PlanRestaurante.Plan.Nombre,
                        Precio = r.PlanRestaurante.Plan.Precio,
                        FechaInicio = r.PlanRestaurante.FechaInicio,
                        FechaFin = r.PlanRestaurante.FechaFin,
                        FechaPago = r.PlanRestaurante.FechaPago,
                        Pagado = r.PlanRestaurante.Pagado
                    },
                    Amenidades = r.AmenidadRestaurantes.Select(a => new AmenidadDto
                    {
                        Id = a.Id,
                        Nombre = a.Amenidad.Nombre
                    }).Where(a => a.Id != Guid.Empty).ToList(),
                    Categorias = r.CategoriaRestaurantes.Select(c => new CategoriaDto
                    {
                        Id = c.Categoria.Id,
                        Nombre = c.Categoria.Nombre,

                    }).Where(c => c.Id != Guid.Empty).ToList()
                }).FirstAsync(r => r.Id == id);
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

                //Agregar el listado de Categorias
                foreach (var categoriaId in dto.CategoriaIds)
                {
                    var categoria = await _context.Categorias.FindAsync(categoriaId);
                    if (categoria == null)
                        throw new ArgumentException("Una de las categorías especificadas no existe.");

                    var categoriaRestaurante = new CategoriaRestaurantes
                    {
                        CategoriaId = categoria.Id,
                        RestauranteId = restaurante.Id
                    };

                    _context.CategoriaRestaurantes.Add(categoriaRestaurante);
                }
                //Agregar el listado de Amenidades
                foreach (var amenidadId in dto.AmenidadIds)
                {
                    var amenidad = await _context.Amenidades.FindAsync(amenidadId);
                    if (amenidad == null)
                        throw new ArgumentException("Una de las amenidades especificadas no existe.");

                    var amenidadRestaurante = new AmenidadRestaurantes
                    {
                        AmenidadId = amenidad.Id,
                        RestauranteId = restaurante.Id
                    };

                    _context.AmenidadRestaurantes.Add(amenidadRestaurante);
                }

                var planRestaurante = new PlanRestaurante
                {
                    RestauranteId = restaurante.Id,
                    PlanId = plan.Id,
                    FechaInicio = fechaInicio,
                    FechaFin = fechaFin,
                    Pagado = false
                };

                _context.PlanesRestaurantes.Add(planRestaurante);
                await _context.SaveChangesAsync();

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