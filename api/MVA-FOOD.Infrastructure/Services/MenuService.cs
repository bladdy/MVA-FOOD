using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Infrastructure.Helpers;
using MVA_FOOD.Core.Enums;
using System.Text.Json;

namespace MVA_FOOD.Infrastructure.Services
{
    public class MenuService : IMenuService
    {
        private readonly AppDbContext _context;

        public MenuService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MenuDto>> GetAllAsync()
        {
            return await _context.Menus
                .Include(r => r.Restaurante)
                .Include(m => m.Categoria)
                .Include(m => m.Variantes)
                .ThenInclude(v => v.Opciones)
                .Select(m => new MenuDto
                {
                    Id = m.Id,
                    Nombre = m.Nombre,
                    Ingredientes = m.Ingredientes,
                    Precio = m.Precio,
                    RestauranteId = m.RestauranteId,
                    CategoriaId = m.CategoriaId,
                    Categoria = m.Categoria != null ? new CategoriaDto
                    {
                        Id = m.Categoria.Id,
                        Nombre = m.Categoria.Nombre
                    } : null,
                    Variantes = m.Variantes.Select(v => new VarianteDto
                    {
                        Id = v.Id,
                        Name = v.Name,
                        Obligatorio = v.Obligatorio,
                        MaxSeleccion = v.MaxSeleccion,
                        Opciones = v.Opciones.Select(op => new VarianteOpcionDto
                        {
                            Id = op.Id,
                            Nombre = op.Nombre,
                            Precio = op.Precio
                        }).ToList()
                    }).ToList()
                }).ToListAsync();
        }


        public async Task<MenuDto> GetByIdAsync(Guid id)
        {
            var menu = await _context.Menus.Include(m => m.Categoria).FirstOrDefaultAsync(m => m.Id == id);
            if (menu == null) return null;

            return new MenuDto
            {
                Id = menu.Id,
                Nombre = menu.Nombre,
                Ingredientes = menu.Ingredientes,
                Precio = menu.Precio,
                CategoriaId = menu.CategoriaId,
                Categoria = menu.Categoria != null ? new CategoriaDto
                {
                    Id = menu.Categoria.Id,
                    Nombre = menu.Categoria.Nombre
                } : null
            };
        }
        public async Task<MenuDto> CreateAsync(MenuCreateDto dto)
        {
            Console.WriteLine($"===== VARIANTES DETECTADAS ====={ dto.Variantes?.Count}");
            foreach (var v in dto.Variantes)
            {
                Console.WriteLine($"Variante: {v.Name}, Opciones: {v.Opciones?.Count}");
                foreach (var op in v.Opciones)
                {
                    Console.WriteLine($"  Opción: {op.Nombre}, Precio: {op.Precio}");
                }
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1️⃣ Crear la entidad Menu
                var menu = new Menu
                {
                    Nombre = dto.Nombre,
                    Ingredientes = dto.Ingredientes,
                    Precio = dto.Precio,
                    CategoriaId = dto.CategoriaId,
                    RestauranteId = dto.RestauranteId,
                    Imagen = dto.Image != null
                        ? await ImagenesHelpers.GuardarImagenAsync(dto.Image, Imagenes.Menu.ToString())
                        : null!,
                    Variantes = new List<Variante>()
                };

                _context.Menus.Add(menu);
                await _context.SaveChangesAsync(); // Guardar Menu primero para obtener Id

                // 2️⃣ Mapear variantes y opciones desde dto.Variantes
                if (dto.Variantes != null && dto.Variantes.Any())
                {
                    foreach (var v in dto.Variantes)
                    {
                        var variante = new Variante
                        {
                            Id = Guid.NewGuid(),
                            MenuId = menu.Id, // asociar variante al menú
                            Name = v.Name,
                            Obligatorio = v.Obligatorio,
                            MaxSeleccion = v.MaxSeleccion ?? 1,
                            Opciones = new List<VarianteOpcion>()
                        };

                        _context.Variantes.Add(variante);
                        await _context.SaveChangesAsync(); // Guardar variante para obtener Id

                        if (v.Opciones != null && v.Opciones.Any())
                        {
                            foreach (var op in v.Opciones)
                            {
                                var opcion = new VarianteOpcion
                                {
                                    Id = Guid.NewGuid(),
                                    VarianteId = variante.Id,
                                    Nombre = op.Nombre,
                                    Precio = op.Precio
                                };
                                _context.VarianteOpciones.Add(opcion);
                            }

                            await _context.SaveChangesAsync(); // Guardar opciones
                        }
                    }
                }

                // 3️⃣ Cargar referencias
                var categoria = await _context.Categorias.FindAsync(dto.CategoriaId);
                var restaurante = await _context.Restaurantes.FindAsync(dto.RestauranteId);

                // 4️⃣ Mapear variantes y opciones al DTO de salida
                var variantesDtoResult = await _context.Variantes
                    .Where(v => v.MenuId == menu.Id)
                    .Include(v => v.Opciones)
                    .Select(v => new VarianteDto
                    {
                        Id = v.Id,
                        Name = v.Name,
                        Obligatorio = v.Obligatorio,
                        MaxSeleccion = v.MaxSeleccion,
                        Opciones = v.Opciones.Select(op => new VarianteOpcionDto
                        {
                            Id = op.Id,
                            Nombre = op.Nombre,
                            Precio = op.Precio
                        }).ToList()
                    }).ToListAsync();

                // 5️⃣ Confirmar transacción
                await transaction.CommitAsync();

                // 6️⃣ Devolver DTO final
                return new MenuDto
                {
                    Id = menu.Id,
                    Nombre = menu.Nombre,
                    Ingredientes = menu.Ingredientes,
                    Precio = menu.Precio,
                    RestauranteId = menu.RestauranteId,
                    Restaurante = restaurante != null ? new RestauranteDto
                    {
                        Id = restaurante.Id,
                        Name = restaurante.Name,
                        Image = restaurante.Image,
                        PerfilImage = restaurante.PerfilImage,
                        Direccion = restaurante.Direccion,
                        Phone = restaurante.Phone,
                    } : null,
                    CategoriaId = menu.CategoriaId,
                    Categoria = categoria != null ? new CategoriaDto
                    {
                        Id = categoria.Id,
                        Nombre = categoria.Nombre
                    } : null,
                    Variantes = variantesDtoResult
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

        public async Task<bool> UpdateAsync(Guid id, MenuUpdateDto dto)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null) return false;

            menu.Nombre = dto.Nombre;
            menu.Ingredientes = dto.Ingredientes;
            menu.Precio = dto.Precio;
            menu.CategoriaId = dto.CategoriaId;

            _context.Menus.Update(menu);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null) return false;

            _context.Menus.Remove(menu);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
