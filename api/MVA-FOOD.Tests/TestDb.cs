using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Tests;

/// <summary>
/// Contexto SQLite en memoria por test. El esquema se crea con EnsureCreated
/// (equivalente al modelo; incluye los índices únicos definidos en AppDbContext).
/// </summary>
internal sealed class TestDb : IDisposable
{
    public SqliteConnection Connection { get; }
    public AppDbContext Context { get; }

    public TestDb()
    {
        Connection = new SqliteConnection("DataSource=:memory:");
        Connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(Connection)
            .Options;
        Context = new AppDbContext(options);
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Dispose();
        Connection.Dispose();
    }

    public async Task<Semilla> SemillarAsync()
    {
        var plan = new Plan { Nombre = "Plan Gratuito", Precio = 0m, DuracionDias = 7 };
        Context.Planes.Add(plan);
        await Context.SaveChangesAsync();

        var restaurante = new Restaurante
        {
            Name = "Restaurante Test",
            Slug = "restaurante-test",
            Image = "/img.png",
            PerfilImage = "/perfil.png",
            Direccion = "Calle 1",
            Phone = "8095550000",
            Slogan = "Slogan",
            Instagram = "ig",
            Facebook = "fb",
            WhatsApp = "wa",
            Pais = "DO",
            PrefijoFactura = "F",
            SecuenciaFactura = 1,
            PorcentajeImpuesto = 0,
            ImpuestoIncluido = true,
            PlanRestaurante = new PlanRestaurante
            {
                Plan = plan,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddDays(7),
                FechaPago = DateTime.UtcNow,
                Pagado = true
            }
        };
        Context.Restaurantes.Add(restaurante);
        await Context.SaveChangesAsync();

        var comida = new Categoria { Nombre = "Plato Fuerte" };
        Context.Categorias.Add(comida);
        await Context.SaveChangesAsync();

        var menu = new Menu
        {
            Nombre = "Chuleta Ahumada",
            Ingredientes = "cerdo, ahumado",
            Precio = 250m,
            Imagen = "/plato.jpg",
            Activo = true,
            RestauranteId = restaurante.Id,
            CategoriaId = comida.Id
        };
        Context.Menus.Add(menu);

        var mesa = new Mesa
        {
            Numero = 1,
            Capacidad = 4,
            EstaOcupada = false,
            Codigo = "M1",
            RestauranteId = restaurante.Id
        };
        Context.Mesas.Add(mesa);

        var mesa2 = new Mesa
        {
            Numero = 2,
            Capacidad = 2,
            EstaOcupada = false,
            Codigo = "M2",
            RestauranteId = restaurante.Id
        };
        Context.Mesas.Add(mesa2);

        await Context.SaveChangesAsync();

        return new Semilla(restaurante.Id, mesa.Id, mesa2.Id, menu.Id);
    }
}

internal sealed record Semilla(Guid RestauranteId, Guid MesaId, Guid Mesa2Id, Guid MenuId);

/// <summary>
/// Helpers para armar pedidos y cuentas de prueba.
/// </summary>
internal static class DbHelpers
{
    public const string PENDIENTE = "Pendiente";
    public const string LISTO = "Listo";
    public const string ENTREGADO = "Entregado";
    public const string CANCELADO = "Cancelado";

    public static async Task<Guid> AbrirCuentaAsync(AppDbContext ctx, Guid restauranteId, Guid mesaId)
    {
        var mesa = await ctx.Mesas.FindAsync(mesaId);
        var cuenta = new CuentaMesa
        {
            RestauranteId = restauranteId,
            MesaId = mesaId,
            Estado = EstadoCuentaMesa.Abierta,
            FechaApertura = DateTime.UtcNow
        };
        ctx.CuentasMesas.Add(cuenta);
        if (mesa != null)
            mesa.EstaOcupada = true;
        await ctx.SaveChangesAsync();
        return cuenta.Id;
    }

    public static async Task<Guid> CrearPedidoAsync(
        AppDbContext ctx, Guid restauranteId, Guid mesaId, Guid? menuId,
        params (int cantidad, decimal precio, Estado estado, string notas)[] items)
    {
        var pedido = new Pedido
        {
            ClienteNombre = "Mesa",
            ClienteTelefono = "",
            TipoEntrega = "en mesa",
            RestauranteId = restauranteId,
            MesaId = mesaId,
            NumeroMesa = 1,
            Activo = true,
            Items = items
                .Select(i => new PedidoItem
                {
                    MenuId = menuId,
                    Precio = i.precio,
                    Cantidad = i.cantidad,
                    Estado = i.estado,
                    Notas = i.notas
                })
                .ToList()
        };
        pedido.CalcularTotal();
        ctx.Pedidos.Add(pedido);
        await ctx.SaveChangesAsync();
        return pedido.Id;
    }

    private static readonly Random _rand = new Random();

    public static async Task<Guid> CrearUsuarioAsync(
        AppDbContext ctx, Guid restauranteId, string rol, string nombre, bool activo = true)
    {
        var usuario = new Usuario
        {
            Nombre = nombre,
            UsuarioNombre = $"{nombre.ToLower().Replace(" ", "")}_{_rand.Next(10000, 99999)}",
            PasswordHash = "x",
            Rol = rol,
            Activo = activo,
            RestauranteId = restauranteId
        };
        ctx.Usuarios.Add(usuario);
        await ctx.SaveChangesAsync();
        return usuario.Id;
    }

    public static async Task<Guid> CrearFacturaAsync(
        AppDbContext ctx, Guid restauranteId, DateTime fecha, decimal propina,
        bool anulada = false, decimal subtotal = 0)
        => await CrearFacturaAsync(
            ctx, restauranteId, fecha, propina,
            anulada ? EstadoFacturaVenta.Anulada : EstadoFacturaVenta.Emitida, subtotal);

    public static async Task<Guid> CrearFacturaAsync(
        AppDbContext ctx, Guid restauranteId, DateTime fecha, decimal propina,
        EstadoFacturaVenta estado, decimal subtotal = 0)
    {
        var factura = new FacturaVenta
        {
            RestauranteId = restauranteId,
            NumeroFactura = $"T-{_rand.Next(100000, 999999)}",
            FechaEmision = fecha,
            ClienteNombre = "Mesa",
            MetodoPago = "Efectivo",
            TipoEntrega = "en mesa",
            Propina = propina,
            Subtotal = subtotal,
            Impuesto = 0,
            Total = subtotal,
            TotalConPropina = subtotal + propina,
            Estado = estado
        };
        ctx.FacturasVentas.Add(factura);
        await ctx.SaveChangesAsync();
        return factura.Id;
    }

    public static async Task<Estado> EstadoPedidoAsync(AppDbContext ctx, Guid pedidoId)
    {
        var pedido = await ctx.Pedidos.AsNoTracking().Include(p => p.Items).FirstAsync(p => p.Id == pedidoId);
        return pedido.Estado;
    }

    public static async Task<EstadoCuentaMesa> EstadoCuentaAsync(AppDbContext ctx, Guid mesaId)
    {
        var cuenta = await ctx.CuentasMesas.AsNoTracking().FirstAsync(c => c.MesaId == mesaId);
        return cuenta.Estado;
    }
}