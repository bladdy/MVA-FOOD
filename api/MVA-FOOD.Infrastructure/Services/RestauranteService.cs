using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
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

            // ✅ Filtros dinámicos
            if (!string.IsNullOrEmpty(filter.Search))
            {
                var search = filter.Search.ToLower();

                query = query.Where(r =>
                    r.Name.ToLower().Contains(search) ||
                    r.Direccion.ToLower().Contains(search) ||
                    r.Slogan.ToLower().Contains(search) ||
                    r.CategoriaRestaurantes.Any(c => c.Categoria.Nombre.ToLower().Contains(search))
                );
            }

            if (filter.TipoId.HasValue)
            {
                query = query.Where(r => r.PlanRestaurante != null && r.PlanRestaurante.PlanId == filter.TipoId.Value);
            }

            if (filter.AmenidadId.HasValue)
            {
                query = query.Where(r => r.AmenidadRestaurantes.Any(a => a.AmenidadId == filter.AmenidadId.Value));
            }

            if (!string.IsNullOrEmpty(filter.Ubicacion))
            {
                query = query.Where(r => r.Direccion.Contains(filter.Ubicacion));
            }

            // ✅ Ordenamiento dinámico (null-safe)
            query = filter.OrderBy?.ToLower() switch
            {
                "nombre" => filter.OrderDirection == "desc"
                    ? query.OrderByDescending(r => r.Name)
                    : query.OrderBy(r => r.Name),

                "tipo" => filter.OrderDirection == "desc"
                    ? query.OrderByDescending(r => r.PlanRestaurante != null ? r.PlanRestaurante.Plan.Nombre : "")
                    : query.OrderBy(r => r.PlanRestaurante != null ? r.PlanRestaurante.Plan.Nombre : ""),

                "categorias" => filter.OrderDirection == "desc"
                    ? query.OrderByDescending(r => r.CategoriaRestaurantes.FirstOrDefault().Categoria.Nombre ?? "")
                    : query.OrderBy(r => r.CategoriaRestaurantes.FirstOrDefault().Categoria.Nombre ?? ""),

                _ => query.OrderBy(r => r.Name)
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
                    Slug = r.Slug,
                    PerfilImage = r.PerfilImage,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    Slogan = r.Slogan,
                    PlanId = r.PlanRestauranteId,

                    PlanRestauranteDto = r.PlanRestaurante == null ? null : new PlanRestauranteDto
                    {
                        Id = r.PlanRestaurante.Id,
                        Nombre = r.PlanRestaurante.Plan != null ? r.PlanRestaurante.Plan.Nombre : null,
                        Precio = r.PlanRestaurante.Plan != null ? r.PlanRestaurante.Plan.Precio : 0,
                        FechaInicio = r.PlanRestaurante.FechaInicio,
                        FechaFin = r.PlanRestaurante.FechaFin,
                        FechaPago = r.PlanRestaurante.FechaPago,
                        Pagado = r.PlanRestaurante.Pagado
                    },

                    Amenidades = r.AmenidadRestaurantes != null
                        ? r.AmenidadRestaurantes
                            .Where(a => a.Amenidad != null)
                            .Select(a => new AmenidadDto
                            {
                                Id = a.Amenidad.Id,
                                Nombre = a.Amenidad.Nombre
                            }).ToList()
                        : new List<AmenidadDto>(),

                    Categorias = r.CategoriaRestaurantes != null
                        ? r.CategoriaRestaurantes
                            .Where(c => c.Categoria != null)
                            .Select(c => new CategoriaDto
                            {
                                Id = c.Categoria.Id,
                                Nombre = c.Categoria.Nombre
                            }).ToList()
                        : new List<CategoriaDto>()
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
                    Slug = r.Slug,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    Slogan = r.Slogan,
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

        public async Task<RestauranteDto> GetBySlugAsync(string slug)
        {
            return await _context.Restaurantes
                .Include(r => r.PlanRestaurante)
                    .ThenInclude(pr => pr.Plan)
                .Include(r => r.Menu)
                    .ThenInclude(m => m.Categoria)
                .Include(r => r.Menu)
                    .ThenInclude(m => m.VarianteMenus)
                        .ThenInclude(vm => vm.Variante)
                            .ThenInclude(v => v.Opciones)
                .Include(r => r.Horario)
                .Include(r => r.AmenidadRestaurantes)
                    .ThenInclude(ar => ar.Amenidad)
                .Include(r => r.CategoriaRestaurantes)
                    .ThenInclude(cr => cr.Categoria)
                .Include(r => r.Combos)
                    .ThenInclude(c => c.Items)
                        .ThenInclude(ci => ci.Menu)
                .Include(r => r.Combos)
                    .ThenInclude(c => c.Sugerencias)
                .Include(r => r.TiposEntrega)
                .Include(r => r.MetodosPago)
                .Where(r => r.Slug == slug)
                .Select(r => new RestauranteDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Image = r.Image,
                    PerfilImage = r.PerfilImage,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    Slogan = r.Slogan,
                    PlanId = r.PlanRestauranteId,
                    Slug = r.Slug,
                    Menu = r.Menu.Where(m => m.Activo == true)
                    .Select(m => new MenuDto
                    {
                        Id = m.Id,
                        Nombre = m.Nombre,
                        CategoriaId = m.CategoriaId,
                        Categoria = m.Categoria == null
                            ? null
                            : new CategoriaDto
                            {
                                Id = m.Categoria.Id,
                                Nombre = m.Categoria.Nombre
                            },
                        Ingredientes = m.Ingredientes,
                        Precio = m.Precio,
                        Imagen = m.Imagen,
                        Variantes = m.VarianteMenus
                            .Select(vm => new VarianteDto
                            {
                                Id = vm.Variante.Id,
                                Name = vm.Variante.Name,
                                CategoriaId = vm.Variante.CategoriaId,
                                Obligatorio = vm.Variante.Obligatorio,
                                MaxSeleccion = vm.Variante.MaxSeleccion,
                                Opciones = vm.Variante.Opciones
                                    .Select(o => new VarianteOpcionDto
                                    {
                                        Id = o.Id,
                                        Nombre = o.Nombre,
                                        Precio = o.Precio
                                    }).ToList()
                            }).ToList()
                    }).ToList(),

                    PlanRestauranteDto = r.PlanRestaurante == null
                        ? null
                        : new PlanRestauranteDto
                        {
                            Id = r.PlanRestaurante.Id,
                            Nombre = r.PlanRestaurante.Plan != null
                                ? r.PlanRestaurante.Plan.Nombre
                                : null,
                            Precio = r.PlanRestaurante.Plan != null
                                ? r.PlanRestaurante.Plan.Precio
                                : 0,
                            FechaInicio = r.PlanRestaurante.FechaInicio,
                            FechaFin = r.PlanRestaurante.FechaFin,
                            FechaPago = r.PlanRestaurante.FechaPago,
                            Pagado = r.PlanRestaurante.Pagado
                        },

                    Amenidades = r.AmenidadRestaurantes
                        .Where(a => a.Amenidad != null)
                        .Select(a => new AmenidadDto
                        {
                            Id = a.Amenidad.Id,
                            Nombre = a.Amenidad.Nombre
                        })
                        .ToList(),

                    Categorias = r.CategoriaRestaurantes
                        .Where(c => c.Categoria != null)
                    .Select(c => new CategoriaDto
                            {
                                Id = c.Categoria.Id,
                                Nombre = c.Categoria.Nombre
                            })
                            .ToList(),

                    Horarios = r.Horario
                        .Select(h => new HorarioDto
                        {
                            Id = h.Id,
                            Dia = h.Dia,
                            HoraApertura = h.HoraApertura,
                            HoraCierre = h.HoraCierre
                        })
                        .ToList(),

                    Combos = r.Combos
                        .Where(c => c.Activo)
                        .Select(c => new ComboDto
                        {
                            Id = c.Id,
                            Nombre = c.Nombre,
                            Descripcion = c.Descripcion,
                            Precio = c.Precio,
                            Imagen = c.Imagen,
                            Activo = c.Activo,
                            Predefinido = c.Predefinido,
                            RestauranteId = c.RestauranteId,
                            Items = c.Items
                                .Select(i => new ComboItemDto
                                {
                                    MenuId = i.MenuId,
                                    MenuNombre = i.Menu.Nombre,
                                    MenuPrecio = i.Menu.Precio,
                                    MenuImagen = i.Menu.Imagen,
                                    Cantidad = i.Cantidad
                                }).ToList(),
                            Sugerencias = c.Sugerencias
                                .Select(s => new ComboSugeridoDto
                                {
                                    MenuId = s.MenuId,
                                    MenuNombre = s.Menu.Nombre,
                                    PrecioAdicional = s.PrecioAdicional
                                }).ToList()
                        }).ToList(),

                    TiposEntrega = r.TiposEntrega
                        .Select(t => new TipoEntregaDto
                        {
                            Id = t.Id,
                            RestauranteId = t.RestauranteId,
                            Nombre = t.Nombre,
                            TiempoMinutos = t.TiempoMinutos,
                            CostoFijo = t.CostoFijo,
                            Porcentaje = t.Porcentaje,
                            Activo = t.Activo
                        }).ToList(),

                    MetodosPago = r.MetodosPago
                        .Select(m => new MetodoPagoDto
                        {
                            Id = m.Id,
                            RestauranteId = m.RestauranteId,
                            Nombre = m.Nombre,
                            Icono = m.Icono,
                            Activo = m.Activo
                        }).ToList()
                })
                .FirstOrDefaultAsync();
        }
        public async Task<RestauranteDto?> GetByIdAsync(Guid id)
        {
            return await _context.Restaurantes
                .Include(r => r.PlanRestaurante)
                    .ThenInclude(pr => pr.Plan)
                .Include(r => r.Menu)
                    .ThenInclude(m => m.Categoria)
                .Include(r => r.Horario)
                .Include(r => r.AmenidadRestaurantes)
                    .ThenInclude(ar => ar.Amenidad)
                .Include(r => r.CategoriaRestaurantes)
                    .ThenInclude(cr => cr.Categoria)
                .Include(r => r.Combos)
                    .ThenInclude(c => c.Items)
                        .ThenInclude(ci => ci.Menu)
                .Include(r => r.Combos)
                    .ThenInclude(c => c.Sugerencias)
                .Include(r => r.TiposEntrega)
                .Include(r => r.MetodosPago)
                .Where(r => r.Id == id)
                .Select(r => new RestauranteDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Image = r.Image,
                    PerfilImage = r.PerfilImage,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    Slogan = r.Slogan,
                    PlanId = r.PlanRestauranteId,
                    Slug = r.Slug,
                    Menu = r.Menu.Where(m => m.Activo == true)
                    .Select(m => new MenuDto
                    {
                        Id = m.Id,
                        Nombre = m.Nombre,
                        CategoriaId = m.CategoriaId,
                        Categoria = m.Categoria == null
                            ? null
                            : new CategoriaDto
                            {
                                Id = m.Categoria.Id,
                                Nombre = m.Categoria.Nombre
                            },
                        Ingredientes = m.Ingredientes,
                        Precio = m.Precio,
                        Imagen = m.Imagen
                    }).ToList(),

                    PlanRestauranteDto = r.PlanRestaurante == null
                        ? null
                        : new PlanRestauranteDto
                        {
                            Id = r.PlanRestaurante.Id,
                            Nombre = r.PlanRestaurante.Plan != null
                                ? r.PlanRestaurante.Plan.Nombre
                                : null,
                            Precio = r.PlanRestaurante.Plan != null
                                ? r.PlanRestaurante.Plan.Precio
                                : 0,
                            FechaInicio = r.PlanRestaurante.FechaInicio,
                            FechaFin = r.PlanRestaurante.FechaFin,
                            FechaPago = r.PlanRestaurante.FechaPago,
                            Pagado = r.PlanRestaurante.Pagado
                        },

                    Amenidades = r.AmenidadRestaurantes
                        .Where(a => a.Amenidad != null)
                        .Select(a => new AmenidadDto
                        {
                            Id = a.Amenidad.Id,
                            Nombre = a.Amenidad.Nombre
                        })
                        .ToList(),

                    Categorias = r.CategoriaRestaurantes
                        .Where(c => c.Categoria != null)
                        .Select(c => new CategoriaDto
                        {
                            Id = c.Categoria.Id,
                            Nombre = c.Categoria.Nombre
                        })
                        .ToList(),

                    Horarios = r.Horario
                        .Select(h => new HorarioDto
                        {
                            Id = h.Id,
                            Dia = h.Dia,
                            HoraApertura = h.HoraApertura,
                            HoraCierre = h.HoraCierre
                        })
                        .ToList(),

                    Combos = r.Combos
                        .Where(c => c.Activo)
                        .Select(c => new ComboDto
                        {
                            Id = c.Id,
                            Nombre = c.Nombre,
                            Descripcion = c.Descripcion,
                            Precio = c.Precio,
                            Imagen = c.Imagen,
                            Activo = c.Activo,
                            Predefinido = c.Predefinido,
                            RestauranteId = c.RestauranteId,
                            Items = c.Items
                                .Select(i => new ComboItemDto
                                {
                                    MenuId = i.MenuId,
                                    MenuNombre = i.Menu.Nombre,
                                    MenuPrecio = i.Menu.Precio,
                                    MenuImagen = i.Menu.Imagen,
                                    Cantidad = i.Cantidad
                                }).ToList(),
                            Sugerencias = c.Sugerencias
                                .Select(s => new ComboSugeridoDto
                                {
                                    MenuId = s.MenuId,
                                    MenuNombre = s.Menu.Nombre,
                                    PrecioAdicional = s.PrecioAdicional
                                }).ToList()
                        }).ToList(),

                    TiposEntrega = r.TiposEntrega
                        .Select(t => new TipoEntregaDto
                        {
                            Id = t.Id,
                            RestauranteId = t.RestauranteId,
                            Nombre = t.Nombre,
                            TiempoMinutos = t.TiempoMinutos,
                            CostoFijo = t.CostoFijo,
                            Porcentaje = t.Porcentaje,
                            Activo = t.Activo
                        }).ToList(),

                    MetodosPago = r.MetodosPago
                        .Select(m => new MetodoPagoDto
                        {
                            Id = m.Id,
                            RestauranteId = m.RestauranteId,
                            Nombre = m.Nombre,
                            Icono = m.Icono,
                            Activo = m.Activo
                        }).ToList()
                })
                .FirstOrDefaultAsync();
        }
        public async Task<RestauranteDto> CreateAsync(CrearRestauranteDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Validar username
                var usuarioExiste = await _context.Usuarios
                    .AnyAsync(x => x.UsuarioNombre == dto.Username);

                if (usuarioExiste)
                    throw new ArgumentException("El nombre de usuario ya existe.");

                // Crear restaurante
                var restaurante = new Restaurante
                {
                    Name = dto.Nombre,
                    Direccion = dto.Direccion,
                    Slug = GenerateSlug(dto.Nombre),
                    Phone = dto.Telefono,
                    Slogan = dto.Slogan,
                    Image = dto.ImageUrl,
                    PerfilImage = dto.PerfilImageUrl
                };

                _context.Restaurantes.Add(restaurante);
                await _context.SaveChangesAsync();

                // Buscar plan
                var plan = await _context.Planes.FindAsync(dto.PlanId);

                if (plan == null)
                    plan = await _context.Planes.FirstOrDefaultAsync(p => p.Precio == 0);

                var fechaInicio = dto.FechaInicio ?? DateTime.UtcNow;
                var fechaFin = fechaInicio.AddDays(plan.DuracionDias);

                // Categorías
                if (dto.CategoriaIds != null)
                {
                    foreach (var categoriaId in dto.CategoriaIds)
                    {
                        var categoria = await _context.Categorias.FindAsync(categoriaId);

                        if (categoria == null)
                            throw new ArgumentException("Una de las categorías especificadas no existe.");

                        _context.CategoriaRestaurantes.Add(new CategoriaRestaurantes
                        {
                            CategoriaId = categoria.Id,
                            RestauranteId = restaurante.Id
                        });
                    }
                }

                // Amenidades
                if (dto.AmenidadIds != null)
                {
                    foreach (var amenidadId in dto.AmenidadIds)
                    {
                        var amenidad = await _context.Amenidades.FindAsync(amenidadId);

                        if (amenidad == null)
                            throw new ArgumentException("Una de las amenidades especificadas no existe.");

                        _context.AmenidadRestaurantes.Add(new AmenidadRestaurantes
                        {
                            AmenidadId = amenidad.Id,
                            RestauranteId = restaurante.Id
                        });
                    }
                }

                // Horarios
                if (dto.Horarios != null)
                {
                    foreach (var horarioDto in dto.Horarios)
                    {
                        _context.Horarios.Add(new Horario
                        {
                            RestauranteId = restaurante.Id,
                            Dia = horarioDto.Dia,
                            HoraApertura = horarioDto.HoraApertura,
                            HoraCierre = horarioDto.HoraCierre,
                        });
                    }
                }

                // Plan del restaurante
                var planRestaurante = new PlanRestaurante
                {
                    RestauranteId = restaurante.Id,
                    PlanId = plan.Id,
                    FechaInicio = fechaInicio,
                    FechaFin = fechaFin,
                    FechaPago = DateTime.UtcNow,
                    Pagado = false
                };

                _context.PlanesRestaurantes.Add(planRestaurante);

                // Usuario administrador
                var usuario = new Usuario
                {
                    Nombre = dto.NombreUsuario,
                    UsuarioNombre = dto.Username,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Rol = "Admin",
                    RestauranteId = restaurante.Id
                };

                _context.Usuarios.Add(usuario);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return new RestauranteDto
                {
                    Id = restaurante.Id,
                    Name = restaurante.Name,
                    Image = restaurante.Image,
                    PerfilImage = restaurante.PerfilImage,
                    Direccion = restaurante.Direccion,
                    Phone = restaurante.Phone,
                    Slogan = restaurante.Slogan,
                    PlanId = plan.Id
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
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

        public async Task<RestauranteDto> UpdateAsync(Guid id, CrearRestauranteDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var restaurante = await _context.Restaurantes
                    .Include(r => r.AmenidadRestaurantes)
                    .Include(r => r.CategoriaRestaurantes)
                    .Include(r => r.Horario)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (restaurante == null)
                    throw new ArgumentException("El restaurante no existe.");

                // Actualizar datos básicos
                restaurante.Name = dto.Nombre;
                restaurante.Direccion = dto.Direccion;
                restaurante.Phone = dto.Telefono;
                restaurante.Slogan = dto.Slogan;

                if (dto.ImageUrl != null)
                {
                    restaurante.Image = dto.ImageUrl;

                }
                if (dto.PerfilImageUrl != null)
                {
                    restaurante.PerfilImage = dto.PerfilImageUrl;
                }

                // Actualizar Categorías
                var categoriasActuales = restaurante.CategoriaRestaurantes.ToList();
                _context.CategoriaRestaurantes.RemoveRange(categoriasActuales);

                if (dto.CategoriaIds != null)
                {
                    foreach (var categoriaId in dto.CategoriaIds)
                    {
                        var categoria = await _context.Categorias.FindAsync(categoriaId);
                        if (categoria == null)
                            throw new ArgumentException("Una de las categorías especificadas no existe.");

                        _context.CategoriaRestaurantes.Add(new CategoriaRestaurantes
                        {
                            CategoriaId = categoria.Id,
                            RestauranteId = restaurante.Id
                        });
                    }

                }

                // Actualizar Amenidades
                var amenidadesActuales = restaurante.AmenidadRestaurantes.ToList();
                _context.AmenidadRestaurantes.RemoveRange(amenidadesActuales);

                if (dto.AmenidadIds != null)
                {
                    foreach (var amenidadId in dto.AmenidadIds)
                    {
                        var amenidad = await _context.Amenidades.FindAsync(amenidadId);
                        if (amenidad == null)
                            throw new ArgumentException("Una de las amenidades especificadas no existe.");

                        _context.AmenidadRestaurantes.Add(new AmenidadRestaurantes
                        {
                            AmenidadId = amenidad.Id,
                            RestauranteId = restaurante.Id
                        });
                    }

                }

                // Actualizar Horarios
                var horariosActuales = restaurante.Horario.ToList();
                _context.Horarios.RemoveRange(horariosActuales);

                if (dto.Horarios != null)
                {
                    foreach (var h in dto.Horarios)
                    {
                        _context.Horarios.Add(new Horario
                        {
                            Id = Guid.NewGuid(),
                            Dia = h.Dia,
                            HoraApertura = h.HoraApertura,
                            HoraCierre = h.HoraCierre,
                            RestauranteId = restaurante.Id
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Retornar DTO actualizado
                return await GetByIdAsync(restaurante.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
            finally
            {
                await transaction.DisposeAsync();
            }
        }

        private string GenerateSlug(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                return string.Empty;

            // Minúsculas
            nombre = nombre.Trim().ToLowerInvariant();

            // Eliminar acentos
            var normalized = nombre.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            nombre = sb.ToString().Normalize(NormalizationForm.FormC);

            // Reemplazar espacios por guiones
            nombre = Regex.Replace(nombre, @"\s+", "-");

            // Eliminar caracteres especiales
            nombre = Regex.Replace(nombre, @"[^a-z0-9\-]", "");

            // Eliminar guiones duplicados
            nombre = Regex.Replace(nombre, @"-+", "-");

            return nombre.Trim('-');
        }


    }

}

