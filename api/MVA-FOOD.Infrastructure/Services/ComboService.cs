using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class ComboService : IComboService
    {
        private readonly AppDbContext _context;

        public ComboService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ComboDto>> GetAllAsync(Guid? restauranteId = null)
        {
            var query = _context.Combos
                .Include(c => c.Items).ThenInclude(ci => ci.Menu)
                .Include(c => c.Sugerencias).ThenInclude(cs => cs.Menu)
                .AsQueryable();

            if (restauranteId.HasValue)
                query = query.Where(c => c.RestauranteId == restauranteId.Value);

            var combos = await query.OrderBy(c => c.Nombre).ToListAsync();
            return combos.Select(MapToDto).ToList();
        }

        public async Task<ComboDto> GetByIdAsync(Guid id)
        {
            var combo = await _context.Combos
                .Include(c => c.Items).ThenInclude(ci => ci.Menu)
                .Include(c => c.Sugerencias).ThenInclude(cs => cs.Menu)
                .FirstOrDefaultAsync(c => c.Id == id);

            return combo == null ? null : MapToDto(combo);
        }

        public async Task<ComboDto> CreateAsync(ComboCreateDto dto)
        {
            var combo = new Combo
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Precio = dto.Precio,
                Imagen = dto.ImagenUrl ?? "/Img/noimage.png",
                Activo = dto.Activo,
                Predefinido = dto.Predefinido,
                RestauranteId = dto.RestauranteId
            };

            foreach (var itemDto in dto.Items)
            {
                combo.Items.Add(new ComboMenu
                {
                    MenuId = itemDto.MenuId,
                    Cantidad = itemDto.Cantidad
                });
            }

            if (dto.Sugerencias != null)
            {
                foreach (var sugDto in dto.Sugerencias)
                {
                    combo.Sugerencias.Add(new MenuComboSugerido
                    {
                        MenuId = sugDto.MenuId,
                        PrecioAdicional = sugDto.PrecioAdicional
                    });
                }
            }

            _context.Combos.Add(combo);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(combo.Id);
        }

        public async Task<ComboDto> UpdateAsync(Guid id, ComboCreateDto dto)
        {
            var combo = await _context.Combos
                .Include(c => c.Items)
                .Include(c => c.Sugerencias)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (combo == null) return null;

            combo.Nombre = dto.Nombre;
            combo.Descripcion = dto.Descripcion;
            combo.Precio = dto.Precio;
            combo.Activo = dto.Activo;
            combo.Predefinido = dto.Predefinido;
            if (dto.ImagenUrl != null)
                combo.Imagen = dto.ImagenUrl;

            _context.ComboMenus.RemoveRange(combo.Items);
            combo.Items.Clear();
            foreach (var itemDto in dto.Items)
            {
                combo.Items.Add(new ComboMenu
                {
                    MenuId = itemDto.MenuId,
                    Cantidad = itemDto.Cantidad
                });
            }

            _context.MenuComboSugeridos.RemoveRange(combo.Sugerencias);
            combo.Sugerencias.Clear();
            if (dto.Sugerencias != null)
            {
                foreach (var sugDto in dto.Sugerencias)
                {
                    combo.Sugerencias.Add(new MenuComboSugerido
                    {
                        MenuId = sugDto.MenuId,
                        PrecioAdicional = sugDto.PrecioAdicional
                    });
                }
            }

            await _context.SaveChangesAsync();
            return await GetByIdAsync(combo.Id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var combo = await _context.Combos.FindAsync(id);
            if (combo == null) return false;

            _context.Combos.Remove(combo);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ComboDto MapToDto(Combo c)
        {
            return new ComboDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Descripcion = c.Descripcion,
                Precio = c.Precio,
                Imagen = c.Imagen,
                Activo = c.Activo,
                Predefinido = c.Predefinido,
                RestauranteId = c.RestauranteId,
                Items = c.Items.Select(i => new ComboItemDto
                {
                    MenuId = i.MenuId,
                    MenuNombre = i.Menu?.Nombre ?? "",
                    MenuPrecio = i.Menu?.Precio ?? 0,
                    MenuImagen = i.Menu?.Imagen ?? "",
                    Cantidad = i.Cantidad
                }).ToList(),
                Sugerencias = c.Sugerencias?.Select(s => new ComboSugeridoDto
                {
                    MenuId = s.MenuId,
                    MenuNombre = s.Menu?.Nombre ?? "",
                    PrecioAdicional = s.PrecioAdicional
                }).ToList()
            };
        }
    }
}
