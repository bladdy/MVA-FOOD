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
        await CheckPlansAsync();
        await CheckDemoRestaurantsAsync();
    }
    private async Task CheckDemoRestaurantsAsync()
    {
        if (!_context.Restaurantes.Any())
        {
            _context.Restaurantes.Add(new Restaurante
            {
                Name = "Restaurante Demo",
                Direccion = "Un restaurante de ejemplo para pruebas.",                
                Phone = "555-1234",
                Image = "restaurante-demo.jpg",
                PerfilImage = "restaurante-demo-perfil.jpg",
                PlanRestaurante = new PlanRestaurante
                {
                    Plan = _context.Planes.FirstOrDefault(p => p.Nombre == "Plan Gratuito")!,
                    FechaInicio = DateTime.UtcNow,
                    FechaFin = DateTime.UtcNow.AddDays(30),
                    FechaPago = DateTime.UtcNow,
                    Pagado = true
                },
                CategoriaRestaurantes = new List<CategoriaRestaurantes>
                {
                    new CategoriaRestaurantes { Categoria = _context.Categorias.FirstOrDefault(c => c.Nombre == "Plato Fuerte")! },
                    new CategoriaRestaurantes { Categoria = _context.Categorias.FirstOrDefault(c => c.Nombre == "Bebidas")! }
                },
                AmenidadRestaurantes = new List<AmenidadRestaurantes>
                {
                    new AmenidadRestaurantes { Amenidad = _context.Amenidades.FirstOrDefault(a => a.Nombre == "WiFi")! },
                    new AmenidadRestaurantes { Amenidad = _context.Amenidades.FirstOrDefault(a => a.Nombre == "Estacionamiento")! }
                },
                Usuarios = 
                {
                    new Usuario
                    {
                        Nombre = "Admin Demo",
                        UsuarioNombre = "AdminDemo",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                        Rol = "Admin"
                    },
                    new Usuario
                    {
                        Nombre = "Empleado Demo",
                        UsuarioNombre = "EmpleadoDemo",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Empleado123!"),
                        Rol = "Empleado"
                    }
                }
            });
            await _context.SaveChangesAsync();
        }
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

    private async Task CheckPlansAsync()
    {
        if (!_context.Planes.Any())
        {
            _context.Planes.Add(new Plan { Nombre = "Plan Gratuito", Precio = 0m , DuracionDias = 7});
            _context.Planes.Add(new Plan { Nombre = "Plan Básico",  Precio = 9.99m , DuracionDias = 30});
            _context.Planes.Add(new Plan { Nombre = "Plan Premium", Precio = 19.99m , DuracionDias = 30});
            _context.Planes.Add(new Plan { Nombre = "Plan Empresarial", Precio = 49.99m , DuracionDias = 30});
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
