using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.API.Data;
public class SeedDb
{
    private readonly AppDbContext _context;
    public SeedDb(AppDbContext context)
    {
        _context = context;
    }
    public async Task SeedAsync()
    {
        await _context.Database.EnsureCreatedAsync();
        await CheckCategoriesAsync();
        await CheckAmenitiesAsync();
    }

    private async Task CheckAmenitiesAsync()
    {
        if (!_context.Amenidades.Any())
        {
           _context.Amenidades.Add( new Amenidad { Nombre = "WiFi", Svg = "amenity-wifi.svg" });
           _context.Amenidades.Add( new Amenidad { Nombre = "Baños", Svg = "amenity-restroom.svg" });
           _context.Amenidades.Add( new Amenidad { Nombre = "Reservaciones", Svg = "amenity-reservations.svg" });
           _context.Amenidades.Add( new Amenidad { Nombre = "Mascotas", Svg = "amenity-pets.svg" });
           _context.Amenidades.Add( new Amenidad { Nombre = "Estacionamiento", Svg = "amenity-parking.svg" });
           _context.Amenidades.Add( new Amenidad { Nombre = "Accesible", Svg = "amenity-accessible.svg" });
           _context.Amenidades.Add( new Amenidad { Nombre = "Aire Acondicionado", Svg = "amenity-air-conditioning.svg" });
           _context.Amenidades.Add( new Amenidad { Nombre = "Zona de Niños", Svg = "amenity-kids-area.svg" });
           _context.Amenidades.Add( new Amenidad { Nombre = "Terraza", Svg = "amenity-terrace.svg" });
            await _context.SaveChangesAsync();
        }
    }

    private async Task CheckCategoriesAsync()
    {
        if (!_context.Categorias.Any())
        {
            _context.Categorias.Add(new Categoria { Nombre = "Entradas" });
            _context.Categorias.Add(new Categoria { Nombre = "Plato Fuerte" });
            _context.Categorias.Add(new Categoria { Nombre = "Burger & Street Food" });
            _context.Categorias.Add(new Categoria { Nombre = "Steak House" });
            _context.Categorias.Add(new Categoria { Nombre = "Pollo Frito" });
            _context.Categorias.Add(new Categoria { Nombre = "Pastas" });
            _context.Categorias.Add(new Categoria { Nombre = "Sopas" });
            _context.Categorias.Add(new Categoria { Nombre = "Kids" });
            _context.Categorias.Add(new Categoria { Nombre = "Bebidas" });
            _context.Categorias.Add(new Categoria { Nombre = "Postres" });
            await _context.SaveChangesAsync();
        }
    }
}
