using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Infrastructure.Helpers;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Wrappers;
using MVA_FOOD.Core.Enums;

namespace MVA_FOOD.Infrastructure.Services
{
    public class MenuService : IMenuService
    {
        private readonly AppDbContext _context;

        public MenuService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<MenuDto>> GetAllAsync(MenuFilter filter)
        {
            var query = _context.Menus
                .Include(m => m.VarianteMenus)
                    .ThenInclude(mv => mv.Variante)
                        .ThenInclude(v => v.Opciones)
                .Include(m => m.Restaurante)
                .Include(m => m.Categoria)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Search))
                query = query.Where(m => m.Nombre.Contains(filter.Search));

            if (filter.RestauranteId.HasValue)
                query = query.Where(m => m.RestauranteId == filter.RestauranteId.Value);

            if (filter.CategoriaId.HasValue)
                query = query.Where(m => m.CategoriaId == filter.CategoriaId.Value);

            var orderBy = string.IsNullOrWhiteSpace(filter.OrderBy) ? "Nombre" : filter.OrderBy;
            orderBy = orderBy switch
            {
                "nombre" => "Nombre",
                "ingredientes" => "Ingredientes",
                "precio" => "Precio",
                "categoriaId" => "CategoriaId",
                "restauranteId" => "RestauranteId",
                _ => "Nombre"
            };

            query = filter.OrderDirection?.ToLower() == "desc"
                ? query.OrderByDescending(e => EF.Property<object>(e, orderBy))
                : query.OrderBy(e => EF.Property<object>(e, orderBy));

            var totalItems = await query.CountAsync();

            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(m => new MenuDto
                {
                    Id = m.Id,
                    Nombre = m.Nombre,
                    Ingredientes = m.Ingredientes,
                    Precio = m.Precio,
                    Imagen = m.Imagen,
                    RestauranteId = m.RestauranteId,
                    CategoriaId = m.CategoriaId,
                    Categoria = m.Categoria != null ? new CategoriaDto
                    {
                        Id = m.Categoria.Id,
                        Nombre = m.Categoria.Nombre
                    } : null,
                    Variantes = m.VarianteMenus.Select(mv => new VarianteDto
                    {
                        Id = mv.VarianteId,
                        Name = mv.Variante.Name,
                        Obligatorio = mv.Variante.Obligatorio,
                        MaxSeleccion = mv.Variante.MaxSeleccion,
                        Opciones = mv.Variante.Opciones.Select(op => new VarianteOpcionDto
                        {
                            Id = op.Id,
                            Nombre = op.Nombre,
                            Precio = op.Precio
                        }).ToList()
                    }).ToList()
                }).ToListAsync();

            return new PagedResult<MenuDto>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize)
            };
        }

        public async Task<MenuDto> GetByIdAsync(Guid id)
        {
            var menu = await _context.Menus
                .Include(m => m.VarianteMenus)
                    .ThenInclude(mv => mv.Variante)
                        .ThenInclude(v => v.Opciones)
                .Include(m => m.Categoria)
                .Include(m => m.Restaurante)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (menu == null) return null;

            return new MenuDto
            {
                Id = menu.Id,
                Nombre = menu.Nombre,
                Ingredientes = menu.Ingredientes,
                Precio = menu.Precio,
                Imagen = menu.Imagen,
                RestauranteId = menu.RestauranteId,
                Restaurante = menu.Restaurante != null ? new RestauranteDto
                {
                    Id = menu.Restaurante.Id,
                    Name = menu.Restaurante.Name,
                    Image = menu.Restaurante.Image,
                    PerfilImage = menu.Restaurante.PerfilImage,
                    Direccion = menu.Restaurante.Direccion,
                    Phone = menu.Restaurante.Phone
                } : null,
                CategoriaId = menu.CategoriaId,
                Categoria = menu.Categoria != null ? new CategoriaDto
                {
                    Id = menu.Categoria.Id,
                    Nombre = menu.Categoria.Nombre
                } : null,
                Variantes = menu.VarianteMenus.Select(mv => new VarianteDto
                {
                    Id = mv.VarianteId,
                    Name = mv.Variante.Name,
                    Obligatorio = mv.Variante.Obligatorio,
                    MaxSeleccion = mv.Variante.MaxSeleccion,
                    Opciones = mv.Variante.Opciones.Select(op => new VarianteOpcionDto
                    {
                        Id = op.Id,
                        Nombre = op.Nombre,
                        Precio = op.Precio
                    }).ToList()
                }).ToList()
            };
        }
        public async Task<MenuDto> CreateAsync(MenuCreateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Guardar variantes nuevas y obtener sus IDs
                var varianteIds = new List<Guid>();
                if (dto.Variantes != null && dto.Variantes.Any())
                {
                    foreach (var v in dto.Variantes)
                    {
                        if (v.Id == Guid.Empty)
                        {
                            var nuevaVariante = new Variante
                            {
                                Id = Guid.NewGuid(),
                                Name = v.Name,
                                Obligatorio = v.Obligatorio,
                                MaxSeleccion = v.MaxSeleccion ?? 1,
                                CategoriaId = dto.CategoriaId,
                                Opciones = v.Opciones?.Select(op => new VarianteOpcion
                                {
                                    Id = Guid.NewGuid(),
                                    Nombre = op.Nombre,
                                    Precio = op.Precio
                                }).ToList() ?? new List<VarianteOpcion>()
                            };
                            _context.Variantes.Add(nuevaVariante);
                            varianteIds.Add(nuevaVariante.Id);
                        }
                        else
                        {
                            var existente = await _context.Variantes.FindAsync(v.Id);
                            if (existente == null)
                                throw new Exception($"La variante con Id {v.Id} no existe.");
                            varianteIds.Add(v.Id);
                        }
                    }

                    // Guardar todas las variantes nuevas de una sola vez
                    await _context.SaveChangesAsync();
                }

                // 2. Guardar el menú
                var menu = new Menu
                {
                    Nombre = dto.Nombre,
                    Ingredientes = dto.Ingredientes,
                    Precio = dto.Precio,
                    CategoriaId = dto.CategoriaId,
                    Categoria = await _context.Categorias.FindAsync(dto.CategoriaId),
                    RestauranteId = dto.RestauranteId,
                    Imagen = dto.Image != null
                        ? await ImagenesHelpers.GuardarImagenAsync(dto.Image, Imagenes.Menu.ToString())
                        : null!,
                    //VarianteMenus = new List<VarianteMenus>()
                };

                _context.Menus.Add(menu);
                await _context.SaveChangesAsync(); // Guardar menu para tener el Id

                // 3. Crear relaciones VarianteMenus
                foreach (var varianteId in varianteIds)
                {
                    _context.VarianteMenus.Add(new VarianteMenus
                    {
                        MenuId = menu.Id,
                        VarianteId = varianteId
                    });
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return await GetByIdAsync(menu.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<MenuDto> UpdateAsync(Guid id, MenuUpdateDto dto)
        {
            var menu = await _context.Menus
                .Include(m => m.VarianteMenus)
                    .ThenInclude(mv => mv.Variante)
                        .ThenInclude(v => v.Opciones)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (menu == null) return null;

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                menu.Nombre = dto.Nombre;
                menu.Ingredientes = dto.Ingredientes;
                menu.Precio = dto.Precio;
                menu.CategoriaId = dto.CategoriaId;
                menu.Imagen = await ImagenesHelpers.ActualizarImagenAsync(dto.Image, Imagenes.Menu.ToString(), menu.Imagen);

                // IDs que llegan en el DTO
                var variantesDtoIds = dto.Variantes?.Select(v => v.Id).ToList() ?? new List<Guid>();

                // 🔹 Si el DTO viene vacío → eliminar TODAS las variantes relacionadas
                if (variantesDtoIds.Count == 0)
                {
                    if (menu.VarianteMenus.Any())
                    {
                        _context.VarianteMenus.RemoveRange(menu.VarianteMenus);
                    }
                }
                else
                {
                    // 🔹 Si trae variantes → eliminar solo las que ya no estén en el DTO
                    var relacionesADesvincular = menu.VarianteMenus
                        .Where(mv => !variantesDtoIds.Contains(mv.VarianteId))
                        .ToList();

                    if (relacionesADesvincular.Any())
                    {
                        _context.VarianteMenus.RemoveRange(relacionesADesvincular);
                    }
                }

                // Crear o actualizar variantes
                foreach (var vDto in dto.Variantes)
                {
                    Variante variante;
                    if (vDto.Id == Guid.Empty)
                    {
                        variante = new Variante
                        {
                            Id = Guid.NewGuid(),
                            Name = vDto.Name,
                            Obligatorio = vDto.Obligatorio,
                            MaxSeleccion = vDto.MaxSeleccion ?? 1,
                            CategoriaId = dto.CategoriaId,
                            Opciones = vDto.Opciones?.Select(op => new VarianteOpcion
                            {
                                Id = Guid.NewGuid(),
                                Nombre = op.Nombre,
                                Precio = op.Precio
                            }).ToList() ?? new List<VarianteOpcion>()
                        };
                        _context.Variantes.Add(variante);
                        await _context.SaveChangesAsync();
                    }
                    else
                    {
                        variante = await _context.Variantes
                            .Include(v => v.Opciones)
                            .FirstOrDefaultAsync(v => v.Id == vDto.Id);

                        if (variante == null)
                            throw new Exception($"La variante con Id {vDto.Id} no existe.");

                        variante.Name = vDto.Name;
                        variante.Obligatorio = vDto.Obligatorio;
                        variante.MaxSeleccion = vDto.MaxSeleccion ?? 1;

                        // Opciones
                        var opcionesAEliminar = variante.Opciones.Where(o => !vDto.Opciones.Any(x => x.Id == o.Id)).ToList();
                        _context.VarianteOpciones.RemoveRange(opcionesAEliminar);

                        foreach (var opDto in vDto.Opciones)
                        {
                            VarianteOpcion opcion;
                            if (opDto.Id == Guid.Empty)
                            {
                                opcion = new VarianteOpcion
                                {
                                    Id = Guid.NewGuid(),
                                    VarianteId = variante.Id,
                                    Nombre = opDto.Nombre,
                                    Precio = opDto.Precio
                                };
                                _context.VarianteOpciones.Add(opcion);
                            }
                            else
                            {
                                opcion = variante.Opciones.First(o => o.Id == opDto.Id);
                                opcion.Nombre = opDto.Nombre;
                                opcion.Precio = opDto.Precio;
                            }
                        }
                    }

                    if (!menu.VarianteMenus.Any(mv => mv.VarianteId == variante.Id))
                    {
                        _context.VarianteMenus.Add(new VarianteMenus
                        {
                            MenuId = menu.Id,
                            VarianteId = variante.Id
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return await GetByIdAsync(menu.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var menu = await _context.Menus
                    .Include(m => m.VarianteMenus)
                        .ThenInclude(mv => mv.Variante)
                            .ThenInclude(v => v.Opciones)
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (menu == null) return false;

                // Eliminar relaciones muchos a muchos
                if (menu.VarianteMenus.Any())
                    _context.VarianteMenus.RemoveRange(menu.VarianteMenus);

                // Eliminar variantes no usadas
                foreach (var variante in menu.VarianteMenus.Select(mv => mv.Variante))
                {
                    bool estaEnOtroMenu = await _context.VarianteMenus.AnyAsync(vm => vm.VarianteId == variante.Id);
                    if (!estaEnOtroMenu)
                    {
                        if (variante.Opciones.Any())
                            _context.VarianteOpciones.RemoveRange(variante.Opciones);
                        _context.Variantes.Remove(variante);
                    }
                }

                var imagenActual = menu.Imagen;
                _context.Menus.Remove(menu);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                if (!string.IsNullOrEmpty(imagenActual))
                    await ImagenesHelpers.EliminarImagenAsync(imagenActual);

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }
    }
}
