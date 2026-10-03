using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Infrastructure.Services;
using Xunit;

namespace MVA_FOOD.Tests;

/// <summary>
/// Pruebas del cobro en caja: transición PendienteCobro → Pagada con registro de
/// monto recibido, cambio y usuario de caja; bloqueos de la transición; anulación
/// según estado; y el efecto de los nuevos estados en ingresos y propinas.
/// </summary>
public class PagoFacturaVentaTests
{
    private static readonly DateTime HOY = new DateTime(2026, 10, 2, 15, 0, 0, DateTimeKind.Utc);

    private static FacturaVentaService CrearService(TestDb db) => new FacturaVentaService(db.Context);

    [Fact]
    public async Task MarcarPagada_DesdePendienteCobro_RegistraCobro()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var id = await DbHelpers.CrearFacturaAsync(
            db.Context, s.RestauranteId, HOY, 20m, EstadoFacturaVenta.PendienteCobro, 100m);

        var cajaId = Guid.NewGuid();
        var detalle = await CrearService(db).MarcarPagadaAsync(
            id, new PagarFacturaVentaDto { MetodoPago = "Efectivo", MontoRecibido = 150m },
            cajaId, "Ana Caja");

        Assert.NotNull(detalle);
        Assert.Equal((int)EstadoFacturaVenta.Pagada, detalle!.Estado);
        Assert.Equal("Efectivo", detalle.MetodoPago);
        Assert.Equal(150m, detalle.MontoRecibido);
        Assert.Equal(30m, detalle.Cambio);
        Assert.NotNull(detalle.FechaPago);
        Assert.Equal("Ana Caja", detalle.UsuarioCajaNombre);

        var guardada = await db.Context.FacturasVentas.AsNoTracking().FirstAsync(f => f.Id == id);
        Assert.Equal(EstadoFacturaVenta.Pagada, guardada.Estado);
        Assert.Equal(cajaId, guardada.UsuarioCajaId);
    }

    [Fact]
    public async Task MarcarPagada_MontoExacto_NoGeneraCambio()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var id = await DbHelpers.CrearFacturaAsync(
            db.Context, s.RestauranteId, HOY, 0m, EstadoFacturaVenta.PendienteCobro, 100m);

        // Sin MontoRecibido se asume el pago exacto del total.
        var detalle = await CrearService(db).MarcarPagadaAsync(
            id, new PagarFacturaVentaDto { MetodoPago = "Transferencia" }, Guid.NewGuid(), "Ana");

        Assert.NotNull(detalle);
        Assert.Equal(100m, detalle!.MontoRecibido);
        Assert.Equal(0m, detalle.Cambio);
        Assert.Equal("Transferencia", detalle.MetodoPago);
    }

    [Fact]
    public async Task MarcarPagada_MontoInsuficiente_Rechaza()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var id = await DbHelpers.CrearFacturaAsync(
            db.Context, s.RestauranteId, HOY, 0m, EstadoFacturaVenta.PendienteCobro, 100m);

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            CrearService(db).MarcarPagadaAsync(
                id, new PagarFacturaVentaDto { MontoRecibido = 40m }, Guid.NewGuid(), "Ana"));

        Assert.Equal(ErrorCodes.MONTO_INSUFICIENTE, ex.Code);

        var guardada = await db.Context.FacturasVentas.AsNoTracking().FirstAsync(f => f.Id == id);
        Assert.Equal(EstadoFacturaVenta.PendienteCobro, guardada.Estado);
        Assert.Null(guardada.FechaPago);
    }

    [Fact]
    public async Task MarcarPagada_YaPagada_NoCambiaNada()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var id = await DbHelpers.CrearFacturaAsync(
            db.Context, s.RestauranteId, HOY, 0m, EstadoFacturaVenta.PendienteCobro, 100m);
        var service = CrearService(db);
        var usuario = Guid.NewGuid();
        await service.MarcarPagadaAsync(id, new PagarFacturaVentaDto { MontoRecibido = 100m }, usuario, "Ana");

        // Reintento con otro método: la factura ya cobrada no se toca.
        var reintento = await service.MarcarPagadaAsync(
            id, new PagarFacturaVentaDto { MetodoPago = "Tarjeta", MontoRecibido = 500m },
            Guid.NewGuid(), "Otro");

        Assert.NotNull(reintento);
        Assert.Equal(100m, reintento!.MontoRecibido);
        Assert.Equal(EstadoFacturaVenta.Pagada, (EstadoFacturaVenta)reintento.Estado);
    }

    [Fact]
    public async Task MarcarPagada_Anulada_Rechaza()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var id = await DbHelpers.CrearFacturaAsync(
            db.Context, s.RestauranteId, HOY, 0m, EstadoFacturaVenta.Anulada, 100m);

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            CrearService(db).MarcarPagadaAsync(id, new PagarFacturaVentaDto(), Guid.NewGuid(), "Ana"));

        Assert.Equal(ErrorCodes.FACTURA_YA_COBRADA, ex.Code);
    }

    [Fact]
    public async Task MarcarPagada_FacturaDeMostrador_Rechaza()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        // Emitida significa que el cliente ya pagó en mostrador: caja no vuelve a cobrar.
        var id = await DbHelpers.CrearFacturaAsync(
            db.Context, s.RestauranteId, HOY, 0m, EstadoFacturaVenta.Emitida, 100m);

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            CrearService(db).MarcarPagadaAsync(id, new PagarFacturaVentaDto(), Guid.NewGuid(), "Ana"));

        Assert.Equal(ErrorCodes.FACTURA_YA_COBRADA, ex.Code);
    }

    [Fact]
    public async Task MarcarPagada_NoExiste_RetornaNull()
    {
        using var db = new TestDb();
        await db.SemillarAsync();

        var detalle = await CrearService(db).MarcarPagadaAsync(
            Guid.NewGuid(), new PagarFacturaVentaDto(), Guid.NewGuid(), "Ana");

        Assert.Null(detalle);
    }

    [Fact]
    public async Task Anular_Pagada_Rechaza()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var id = await DbHelpers.CrearFacturaAsync(
            db.Context, s.RestauranteId, HOY, 0m, EstadoFacturaVenta.Pagada, 100m);

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            CrearService(db).AnularAsync(id, "error"));

        Assert.Equal(ErrorCodes.TRANSICION_NO_PERMITIDA, ex.Code);

        var guardada = await db.Context.FacturasVentas.AsNoTracking().FirstAsync(f => f.Id == id);
        Assert.Equal(EstadoFacturaVenta.Pagada, guardada.Estado);
    }

    [Fact]
    public async Task Anular_PendienteCobro_LiberaLosPedidos()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, s.RestauranteId, s.MesaId, s.MenuId, (1, 100m, Estado.Entregado, ""));

        var service = CrearService(db);
        var factura = await service.CrearDesdePedidoAsync(
            s.RestauranteId,
            new CrearFacturaVentaDto { PedidoId = pedidoId, Items = new List<FacturaVentaItemDto>() },
            EstadoFacturaVenta.PendienteCobro);

        Assert.NotNull(factura);
        Assert.Equal((int)EstadoFacturaVenta.PendienteCobro, factura!.Estado);

        // El dinero nunca entró, así que anular sí procede y devuelve el pedido al flujo.
        Assert.True(await service.AnularAsync(factura.Id, "el cliente se retiró"));

        var pedido = await db.Context.Pedidos.AsNoTracking().FirstAsync(p => p.Id == pedidoId);
        Assert.Null(pedido.FacturaVentaId);
        Assert.True(await db.Context.FacturasVentas.AsNoTracking()
            .AnyAsync(f => f.Id == factura.Id && f.Estado == EstadoFacturaVenta.Anulada));
    }

    [Fact]
    public async Task FacturaPendienteCobro_BloqueaVolverAFacturarLosMismosPedidos()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var pedidoId = await DbHelpers.CrearPedidoAsync(
            db.Context, s.RestauranteId, s.MesaId, s.MenuId, (1, 100m, Estado.Entregado, ""));

        var service = CrearService(db);
        await service.CrearDesdePedidoAsync(
            s.RestauranteId,
            new CrearFacturaVentaDto { PedidoId = pedidoId, Items = new List<FacturaVentaItemDto>() },
            EstadoFacturaVenta.PendienteCobro);

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            service.CrearDesdePedidoAsync(
                s.RestauranteId,
                new CrearFacturaVentaDto { PedidoId = pedidoId, Items = new List<FacturaVentaItemDto>() },
                EstadoFacturaVenta.PendienteCobro));

        Assert.Equal(ErrorCodes.PEDIDO_YA_FACTURADO, ex.Code);
    }

    [Fact]
    public async Task GetResumenHoy_SeparaCobradoDePorCobrar()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var hoy = DateTime.UtcNow.Date;

        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, hoy, 0m, EstadoFacturaVenta.Emitida, 100m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, hoy, 0m, EstadoFacturaVenta.Pagada, 200m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, hoy, 0m, EstadoFacturaVenta.PendienteCobro, 400m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, hoy, 0m, EstadoFacturaVenta.Anulada, 800m);

        var resumen = await CrearService(db).GetResumenHoyAsync(s.RestauranteId);

        Assert.Equal(2, resumen.CantidadVentas);
        Assert.Equal(300m, resumen.Ingresos);
        Assert.Equal(1, resumen.CantidadAnuladas);
        Assert.Equal(1, resumen.CantidadPorCobrar);
        Assert.Equal(400m, resumen.MontoPorCobrar);
    }

    [Fact]
    public async Task GetReporte_IngresosSoloCobradas_PendientesApartado()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var ahora = DateTime.UtcNow;
        var inicio = new DateTime(ahora.Year, ahora.Month, 1);

        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, ahora, 0m, EstadoFacturaVenta.Emitida, 100m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, ahora, 0m, EstadoFacturaVenta.Pagada, 250m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, ahora, 0m, EstadoFacturaVenta.PendienteCobro, 700m);

        var reporte = await CrearService(db).GetReporteVentasAsync(s.RestauranteId, RangoReporteVentas.Mes);

        Assert.Equal(2, reporte.CantidadVentas);
        Assert.Equal(350m, reporte.Ingresos);
        Assert.Equal(175m, reporte.TicketPromedio);
        Assert.Equal(1, reporte.CantidadPorCobrar);
        Assert.Equal(700m, reporte.MontoPorCobrar);
        Assert.True(inicio <= reporte.Desde);
    }

    [Fact]
    public async Task GetReporte_CubrirPorDiaYMetodoSoloConCobradas()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var ahora = DateTime.UtcNow;

        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, ahora, 0m, EstadoFacturaVenta.Pagada, 100m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, ahora, 0m, EstadoFacturaVenta.PendienteCobro, 900m);

        var reporte = await CrearService(db).GetReporteVentasAsync(s.RestauranteId, RangoReporteVentas.Mes);

        var porDia = reporte.VentasPorDia.Sum(d => d.Total);
        Assert.Equal(100m, porDia);
        // La pendiente no tiene método de pago hasta que caja cobra, así que no debe
        // aparecer agrupada en el reporte de ventas cobradas.
        Assert.Equal(100m, reporte.VentasPorMetodoPago.Sum(m => m.Total));
    }

    [Fact]
    public async Task VentaRapida_NacePagadaConCobroRegistrado()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();

        var factura = await CrearService(db).CrearVentaRapidaAsync(
            s.RestauranteId,
            new CrearFacturaVentaDto
            {
                ClienteNombre = "Mostrador",
                ClienteTelefono = "",
                TipoEntrega = "recoger",
                MetodoPago = "Efectivo",
                MontoRecibido = 60m,
                Items = { new FacturaVentaItemDto { Nombre = "Combo", Precio = 50m, Cantidad = 1 } }
            },
            Guid.NewGuid(),
            "Ana Caja");

        Assert.Equal(EstadoFacturaVenta.Pagada, (EstadoFacturaVenta)factura.Estado);
        Assert.Equal(50m, factura.Total);
        Assert.Equal(60m, factura.MontoRecibido);
        Assert.Equal(10m, factura.Cambio);
        Assert.Equal("Ana Caja", factura.UsuarioCajaNombre);
        Assert.NotNull(factura.FechaPago);
    }

    [Fact]
    public async Task Propinas_IncluyePendienteCobroYPagada()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var hoy = DateTime.UtcNow.Date;

        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, hoy, 100m, EstadoFacturaVenta.Emitida);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, hoy, 50m, EstadoFacturaVenta.PendienteCobro);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, hoy, 70m, EstadoFacturaVenta.Pagada);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, hoy, 999m, EstadoFacturaVenta.Anulada);

        var resumen = await new PropinaService(db.Context)
            .ObtenerResumenAsync(s.RestauranteId, hoy, hoy);

        Assert.Equal(3, resumen.CantidadPendiente);
        Assert.Equal(220m, resumen.TotalPendiente);
    }
}
