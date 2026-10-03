using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Infrastructure.Services;
using Xunit;

namespace MVA_FOOD.Tests;

/// <summary>
/// Pruebas del rediseño del flujo Mesero → Cocina → CuentaMesa → FacturaVenta.
/// Cubren: cuenta autoabierta al enviar el primer pedido de mesa, pre-validación
/// de cierre, snapshot de factura (solo items entregados), secuencia atómica de
/// números, doble cierre (idempotencia), transiciones de estado por item y
/// cancelación de pedidos.
/// </summary>
public class FlujoCuentaMesaTests
{
    [Fact]
    public async Task CreateAsyncDeMesa_AbreCuentaYMarcaOcupada()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();

        var service = new PedidoService(db.Context);
        var pedido = await service.CreateAsync(new PedidoDto
        {
            ClienteNombre = "Mesa 1",
            ClienteTelefono = "",
            TipoEntrega = "en mesa",
            RestauranteId = semilla.RestauranteId,
            MesaId = semilla.MesaId,
            Items =
            {
                new PedidoItemDto { MenuId = semilla.MenuId, Cantidad = 2, Precio = 250m }
            }
        });

        Assert.Equal("Mesa 1", pedido.ClienteNombre);
        Assert.Equal("en mesa", pedido.TipoEntrega);

        var cuenta = await db.Context.CuentasMesas.FirstAsync(c => c.MesaId == semilla.MesaId);
        Assert.Equal(EstadoCuentaMesa.Abierta, cuenta.Estado);
        Assert.Equal(cuenta.Id, pedido.CuentaMesaId);

        var mesa = await db.Context.Mesas.AsNoTracking().FirstAsync(m => m.Id == semilla.MesaId);
        Assert.True(mesa.EstaOcupada);
        Assert.Equal(500m, pedido.Total);
    }

    [Fact]
    public async Task ValidarCierre_ConItemListo_NoPuedeCerrarYListaPendientes()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        var cuentaId = await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);

        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (2, 250m, Estado.Entregado, "sin cebolla"),
            (1, 120m, Estado.Listo, ""));

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));
        var validacion = await service.ValidarCierreAsync(cuentaId);

        Assert.False(validacion.PuedeCerrar);
        Assert.Equal(ErrorCodes.PEDIDOS_PENDIENTES, validacion.Code);
        var pendiente = Assert.Single(validacion.PedidosPendientes);
        var item = Assert.Single(pendiente.Items);
        Assert.Equal("Chuleta Ahumada", item.Nombre);
        Assert.Equal(DbHelpers.LISTO, item.EstadoNombre);
    }

    [Fact]
    public async Task ValidarCierre_TodoEntregado_PuedeCerrarYDevuelveTotal()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        var cuentaId = await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);

        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (2, 100m, Estado.Entregado, ""));

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));
        var validacion = await service.ValidarCierreAsync(cuentaId);

        Assert.True(validacion.PuedeCerrar);
        Assert.Equal(200m, validacion.Total);
        Assert.Single(validacion.PedidosFacturables);
        Assert.Empty(validacion.PedidosPendientes);
    }

    [Fact]
    public async Task CerrarCuenta_GeneraFacturaSnapshotYNumeroSecuencial()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (2, 250m, Estado.Entregado, "sin cebolla"));

        var facturaService = new FacturaVentaService(db.Context);
        var service = new CuentaMesaService(db.Context, facturaService);
        var respuesta = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto
        {
            ClienteNombre = "Juan",
            MetodoPago = "Efectivo"
        });

        Assert.True(respuesta.Success);
        Assert.NotNull(respuesta.FacturaVentaId);
        Assert.Equal(EstadoCuentaMesa.Cerrada, (EstadoCuentaMesa)respuesta.Cuenta!.Estado);

        var factura = await facturaService.GetByIdAsync(respuesta.FacturaVentaId!.Value);
        Assert.NotNull(factura);
        Assert.Equal("F-00001", factura.NumeroFactura);
        Assert.Equal("Juan", factura.ClienteNombre);
        Assert.Equal("Efectivo", factura.MetodoPago);

        var item = Assert.Single(factura.Items);
        Assert.Equal("Chuleta Ahumada", item.Nombre);
        Assert.Equal(semilla.MenuId, item.ProductoId);
        Assert.Equal("sin cebolla", item.Notas);
        Assert.Equal(2, item.Cantidad);
        Assert.Equal(500m, factura.Total);

        var pedido = await db.Context.Pedidos.AsNoTracking().FirstAsync(p => p.Id == pedidoId);
        Assert.Equal(respuesta.FacturaVentaId, pedido.FacturaVentaId);

        // Segunda mesa factura con el siguiente número (secuencia atómica + índice único).
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.Mesa2Id);
        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.Mesa2Id, semilla.MenuId,
            (1, 100m, Estado.Entregado, ""));
        var respuesta2 = await service.CerrarAsync(semilla.Mesa2Id, new CerrarCuentaMesaDto
        {
            ClienteNombre = "María"
        });
        Assert.True(respuesta2.Success);
        var factura2 = await facturaService.GetByIdAsync(respuesta2.FacturaVentaId!.Value);
        Assert.Equal("F-00002", factura2!.NumeroFactura);
    }

    [Fact]
    public async Task CerrarCuenta_SoloFacturaItemsEntregadosYExcluyeCancelados()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 100m, Estado.Entregado, ""),
            (2, 50m, Estado.Cancelado, ""));

        var facturaService = new FacturaVentaService(db.Context);
        var service = new CuentaMesaService(db.Context, facturaService);
        var respuesta = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());

        Assert.True(respuesta.Success);
        Assert.Equal(100m, respuesta.Cuenta!.Total);

        var factura = await facturaService.GetByIdAsync(respuesta.FacturaVentaId!.Value);
        var item = Assert.Single(factura!.Items);
        Assert.Equal(100m, item.Precio);
        Assert.Equal(100m, factura.Total);
    }

    [Fact]
    public async Task CerrarCuenta_ConItemPendiente_DevuelveErrorYRevierteEstado()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Entregado, ""),
            (1, 120m, Estado.Listo, ""));

        var facturaService = new FacturaVentaService(db.Context);
        var service = new CuentaMesaService(db.Context, facturaService);
        var primerIntento = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());

        Assert.False(primerIntento.Success);
        Assert.Equal(ErrorCodes.PEDIDOS_PENDIENTES, primerIntento.Code);
        Assert.Equal(EstadoCuentaMesa.Abierta, await DbHelpers.EstadoCuentaAsync(db.Context, semilla.MesaId));

        // Se entrega todo y el segundo intento cierra con éxito.
        var itemPendiente = await db.Context.PedidoItems.FirstAsync(i => i.Estado == Estado.Listo);
        var pedidoService = new PedidoService(db.Context);
        var (success, _) = await pedidoService.UpdateItemEstadoAsync(pedidoId, itemPendiente.Id, Estado.Entregado);
        Assert.True(success);

        var segundoIntento = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());
        Assert.True(segundoIntento.Success);
    }

    [Fact]
    public async Task CerrarCuentaDosVeces_DevuelveCuentaYaCerradaConMismaFactura()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Entregado, ""));

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));

        var primero = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());
        Assert.True(primero.Success);

        var segundo = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());
        Assert.False(segundo.Success);
        Assert.Equal(ErrorCodes.CUENTA_YA_CERRADA, segundo.Code);
        Assert.Equal(primero.FacturaVentaId, segundo.FacturaVentaId);
    }

    [Fact]
    public async Task UpdetItemEstado_FlujoCocinaYTransicionInvalida()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Pendiente, ""));

        var service = new PedidoService(db.Context);
        var itemId = (await db.Context.PedidoItems.AsNoTracking().FirstAsync(i => i.PedidoId == pedidoId)).Id;

        var (s1, p1) = await service.UpdateItemEstadoAsync(pedidoId, itemId, Estado.EnPreparacion);
        Assert.True(s1);
        Assert.False(p1);
        var (s2, p2) = await service.UpdateItemEstadoAsync(pedidoId, itemId, Estado.Listo);
        Assert.True(s2);
        Assert.False(p2);
        var (s3, p3) = await service.UpdateItemEstadoAsync(pedidoId, itemId, Estado.Entregado);
        Assert.True(s3);
        Assert.True(p3);
        Assert.Equal(Estado.Entregado, await DbHelpers.EstadoPedidoAsync(db.Context, pedidoId));

        var (s4, _) = await service.UpdateItemEstadoAsync(pedidoId, itemId, Estado.Pendiente);
        Assert.False(s4);
    }

    [Fact]
    public async Task UpdateEstado_NoPermiteEstadosIntermediosPeroSiEntregado()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Pendiente, ""));

        var service = new PedidoService(db.Context);

        Assert.False(await service.UpdateEstadoAsync(pedidoId, Estado.EnPreparacion));
        Assert.False(await service.UpdateEstadoAsync(pedidoId, Estado.Listo));

        Assert.True(await service.UpdateEstadoAsync(pedidoId, Estado.Entregado));
        Assert.Equal(Estado.Entregado, await DbHelpers.EstadoPedidoAsync(db.Context, pedidoId));
    }

    [Fact]
    public async Task CancelarAsync_AnulaTodosLosItemsYNolsReintentaFacturar()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.EnPreparacion, ""),
            (1, 120m, Estado.Pendiente, ""));

        var service = new PedidoService(db.Context);
        var cancelado = await service.CancelarAsync(pedidoId);

        Assert.Equal(Estado.Cancelado, cancelado.Estado);
        Assert.All(cancelado.Items, i => Assert.Equal(Estado.Cancelado, i.Estado));
        Assert.False(cancelado.PuedeFacturarse);
    }

    [Fact]
    public async Task PedidoYaFacturado_NoPuedeCancelarse()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Entregado, ""));

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));
        var cierre = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());
        Assert.True(cierre.Success);

        var pedidoService = new PedidoService(db.Context);
        var ex = await Assert.ThrowsAsync<BusinessException>(() => pedidoService.CancelarAsync(pedidoId));
        Assert.Equal(ErrorCodes.PEDIDO_YA_FACTURADO, ex.Code);
    }

    [Fact]
    public async Task Cuenta_AgrupaItemsPorProductoNoColapsaDistintosMenus()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);

        var categoria = await db.Context.Categorias.FirstAsync();
        var papasFritas = new Menu
        {
            Nombre = "Papas Fritas",
            Ingredientes = "papa",
            Precio = 100m,
            Imagen = "/papas.jpg",
            Activo = true,
            RestauranteId = semilla.RestauranteId,
            CategoriaId = categoria.Id
        };
        db.Context.Menus.Add(papasFritas);
        await db.Context.SaveChangesAsync();

        var pedido = new Pedido
        {
            ClienteNombre = "Mesa",
            ClienteTelefono = "",
            TipoEntrega = "en mesa",
            RestauranteId = semilla.RestauranteId,
            MesaId = semilla.MesaId,
            NumeroMesa = 1,
            Activo = true,
            Items = new List<PedidoItem>
            {
                new PedidoItem { MenuId = semilla.MenuId, Precio = 200m, Cantidad = 1, Estado = Estado.Entregado, Notas = "" },
                new PedidoItem { MenuId = papasFritas.Id, Precio = 100m, Cantidad = 1, Estado = Estado.Entregado, Notas = "" }
            }
        };
        db.Context.Pedidos.Add(pedido);
        await db.Context.SaveChangesAsync();

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));
        var cuenta = await service.GetByMesaAsync(semilla.MesaId);

        Assert.NotNull(cuenta);
        Assert.Equal(2, cuenta!.Items.Count);
        Assert.Equal(2, cuenta.Items.Count(i => i.Cantidad == 1));
        Assert.Contains(cuenta.Items, i => i.Nombre == "Chuleta Ahumada");
        Assert.Contains(cuenta.Items, i => i.Nombre == "Papas Fritas");
    }

    [Fact]
    public async Task UpdateEstadoEntregado_PropagaAItems()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Listo, ""),
            (1, 100m, Estado.Listo, ""));

        var service = new PedidoService(db.Context);
        Assert.True(await service.UpdateEstadoAsync(pedidoId, Estado.Entregado));

        var items = await db.Context.PedidoItems
            .AsNoTracking()
            .Where(i => i.PedidoId == pedidoId)
            .ToListAsync();
        Assert.All(items, i => Assert.Equal(Estado.Entregado, i.Estado));
    }

    [Fact]
    public async Task GetByMesa_DespuesDeFacturar_ExcluyePedidosDeLaCuentaAnterior()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Entregado, ""));

        var facturaService = new FacturaVentaService(db.Context);
        var cuentaService = new CuentaMesaService(db.Context, facturaService);

        var respuesta = await cuentaService.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());

        Assert.True(respuesta.Success);
        Assert.NotNull(respuesta.FacturaVentaId);

        var pedidoService = new PedidoService(db.Context);
        var activos = await pedidoService.GetByMesaAsync(semilla.MesaId);

        Assert.DoesNotContain(activos, p => p.Id == pedidoId);
        Assert.Empty(activos);
    }

    [Theory]
    [InlineData("en mesa", true)]
    [InlineData("domicilio", false)]
    public async Task CerrarCuenta_AplicaPropinaSoloEnMesa(string tipoEntrega, bool esperaPropina)
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);

        var restaurante = await db.Context.Restaurantes.FindAsync(semilla.RestauranteId);
        restaurante!.PorcentajePropina = 10m;
        await db.Context.SaveChangesAsync();

        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (2, 250m, Estado.Entregado, ""));

        var facturaService = new FacturaVentaService(db.Context);
        var cuentaService = new CuentaMesaService(db.Context, facturaService);

        var respuesta = await cuentaService.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto
        {
            TipoEntrega = tipoEntrega
        });

        Assert.True(respuesta.Success);

        var factura = await db.Context.FacturasVentas.Include(f => f.Items)
            .FirstAsync(f => f.Id == respuesta.FacturaVentaId!.Value);

        Assert.Equal(500m, factura.Subtotal);
        if (esperaPropina)
        {
            Assert.Equal(10m, factura.PorcentajePropina);
            Assert.Equal(50m, factura.Propina);
            Assert.Equal(550m, factura.TotalConPropina);
        }
        else
        {
            Assert.Equal(0m, factura.PorcentajePropina);
            Assert.Equal(0m, factura.Propina);
            Assert.Equal(factura.Total, factura.TotalConPropina);
        }
    }

    [Fact]
    public async Task ValidarCierre_ConPropinaDevuelveTotalConPropina()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();

        var restaurante = await db.Context.Restaurantes.FindAsync(semilla.RestauranteId);
        restaurante!.PorcentajePropina = 10m;
        await db.Context.SaveChangesAsync();

        var cuentaId = await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (2, 250m, Estado.Entregado, ""));

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));
        var validacion = await service.ValidarCierreAsync(cuentaId);
        var cuenta = await service.GetByMesaAsync(semilla.MesaId);

        Assert.True(validacion.PuedeCerrar);
        Assert.Equal(500m, validacion.Total);
        Assert.Equal(10m, validacion.PorcentajePropina);
        Assert.Equal(50m, validacion.Propina);
        Assert.Equal(550m, validacion.TotalConPropina);

        Assert.Equal(10m, cuenta!.PorcentajePropina);
        Assert.Equal(50m, cuenta.Propina);
        Assert.Equal(550m, cuenta.TotalConPropina);
    }

    [Fact]
    public async Task GetPlatosListosPorMesa_AgrupaSoloListosActivosSinFacturar()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();

        // Mesa 1: 2 listos + 1 cancelado + 1 entregado → cuenta 2 listos.
        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (2, 250m, Estado.Listo, ""),
            (1, 100m, Estado.Cancelado, ""),
            (1, 100m, Estado.Entregado, ""));

        // Mesa 2: listos pero ya facturados → se excluye.
        var pedidoFacturado = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.Mesa2Id, semilla.MenuId,
            (3, 100m, Estado.Listo, ""));
        var factura = new FacturaVenta
        {
            RestauranteId = semilla.RestauranteId,
            NumeroFactura = "F-00001",
            ClienteNombre = "Cliente",
            Items = new List<FacturaVentaItem>(),
            Total = 0m
        };
        db.Context.FacturasVentas.Add(factura);
        await db.Context.SaveChangesAsync();
        var pedido = await db.Context.Pedidos.FindAsync(pedidoFacturado);
        pedido!.FacturaVentaId = factura.Id;
        await db.Context.SaveChangesAsync();

        var service = new PedidoService(db.Context);
        var resultado = await service.GetPlatosListosPorMesaAsync(semilla.RestauranteId);

        var mesa1 = Assert.Single(resultado, r => r.MesaId == semilla.MesaId);
        Assert.Equal(semilla.MesaId, mesa1.MesaId);
        Assert.Equal(1, mesa1.NumeroMesa);
        Assert.Equal(2, mesa1.Listos);
        Assert.DoesNotContain(resultado, r => r.MesaId == semilla.Mesa2Id);
    }

    [Fact]
    public async Task CerrarCuenta_SnapshotaElMeseroDelPedido()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);

        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Entregado, ""));
        var pedido = await db.Context.Pedidos.FindAsync(pedidoId);
        pedido!.MeseroUsuarioId = Guid.NewGuid();
        pedido.MeseroNombre = "María";
        await db.Context.SaveChangesAsync();

        var facturaService = new FacturaVentaService(db.Context);
        var cuentaService = new CuentaMesaService(db.Context, facturaService);

        var respuesta = await cuentaService.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());

        Assert.True(respuesta.Success);
        var factura = await db.Context.FacturasVentas.FirstAsync(f => f.Id == respuesta.FacturaVentaId!.Value);
        Assert.Equal("María", factura.MeseroNombre);
        Assert.Equal(pedido.MeseroUsuarioId, factura.MeseroUsuarioId);
    }

    [Fact]
    public async Task CerrarCuenta_EnviadaACaja_NacePendienteCobroYLiberaLaMesa()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);

        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (2, 250m, Estado.Entregado, ""));

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));
        var respuesta = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());

        Assert.True(respuesta.Success);

        // El mesero no cobra: la factura queda esperando a caja.
        var factura = await db.Context.FacturasVentas.AsNoTracking()
            .FirstAsync(f => f.Id == respuesta.FacturaVentaId!.Value);
        Assert.Equal(EstadoFacturaVenta.PendienteCobro, factura.Estado);
        Assert.Null(factura.FechaPago);

        // La cuenta está cerrada y la mesa ya quedó libre para el siguiente cliente.
        Assert.Equal(EstadoCuentaMesa.Cerrada, await DbHelpers.EstadoCuentaAsync(db.Context, semilla.MesaId));
        var mesa = await db.Context.Mesas.AsNoTracking().FirstAsync(m => m.Id == semilla.MesaId);
        Assert.False(mesa.EstaOcupada);
    }

    [Fact]
    public async Task CerrarCuenta_NoSeVuelveAFacturarLaMismaMesa()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Entregado, ""));

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));
        var primera = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());
        Assert.True(primera.Success);

        // Una orden nueva en la mesa liberada es una cuenta nueva, no una doble factura.
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Entregado, ""));
        var segunda = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto());

        Assert.True(segunda.Success);
        Assert.NotEqual(primera.FacturaVentaId, segunda.FacturaVentaId);
        Assert.Equal(2, await db.Context.FacturasVentas.CountAsync());
    }

    [Fact]
    public async Task CerrarCuenta_NoCobraNiAsignaMetodoDePago()
    {
        using var db = new TestDb();
        var semilla = await db.SemillarAsync();
        await DbHelpers.AbrirCuentaAsync(db.Context, semilla.RestauranteId, semilla.MesaId);
        await DbHelpers.CrearPedidoAsync(
            db.Context, semilla.RestauranteId, semilla.MesaId, semilla.MenuId,
            (1, 250m, Estado.Entregado, ""));

        var service = new CuentaMesaService(db.Context, new FacturaVentaService(db.Context));
        // Aunque el DTO traiga un método, quien lo confirma es caja al registrar el cobro.
        var respuesta = await service.CerrarAsync(semilla.MesaId, new CerrarCuentaMesaDto
        {
            MetodoPago = "Efectivo"
        });

        Assert.True(respuesta.Success);
        var factura = await db.Context.FacturasVentas.AsNoTracking()
            .FirstAsync(f => f.Id == respuesta.FacturaVentaId!.Value);
        Assert.Null(factura.UsuarioCajaId);
        Assert.Null(factura.MontoRecibido);
    }
}