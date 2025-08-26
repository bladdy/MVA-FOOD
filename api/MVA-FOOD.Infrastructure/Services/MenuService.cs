using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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
                .Include(m => m.Categoria)
                .Select(m => new MenuDto
                {
                    Id = m.Id,
                    Nombre = m.Nombre,
                    Ingredientes = m.Ingredientes,
                    Precio = m.Precio,
                    CategoriaId = m.CategoriaId,
                    Categoria = m.Categoria != null ? new CategoriaDto
                    {
                        Id = m.Categoria.Id,
                        Nombre = m.Categoria.Nombre
                    } : null
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
            var menu = new Menu
            {
                Nombre = dto.Nombre,
                Ingredientes = dto.Ingredientes,
                Precio = dto.Precio,
                CategoriaId = dto.CategoriaId,
                RestauranteId = dto.RestauranteId
            };

            _context.Menus.Add(menu);
            await _context.SaveChangesAsync();

            var categoria = await _context.Categorias.FindAsync(dto.CategoriaId);
            var restaurante = await _context.Restaurantes.FindAsync(dto.RestauranteId);

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
                } : null
            };
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
