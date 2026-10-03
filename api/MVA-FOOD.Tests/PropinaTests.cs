using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Infrastructure.Services;
using Xunit;

namespace MVA_FOOD.Tests;

/// <summary>
/// Pruebas del módulo Propinas: configuración del reparto (igual / por rol),
/// resumen por rango de fechas y liquidación (marcar un rango como pagado).
/// </summary>
public class PropinaTests
{
    private static readonly DateTime D1 = new DateTime(2026, 9, 10, 14, 30, 0, DateTimeKind.Utc);

    private static PropinaService CrearService(TestDb db) => new PropinaService(db.Context);

    [Fact]
    public async Task ObtenerResumen_ExcluyeAnuladasFueraDeRangoYConPropinaCero()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Juan");

        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 120m, anulada: true);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1.AddDays(5), 999m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 0m);

        var resumen = await CrearService(db).ObtenerResumenAsync(s.RestauranteId, D1.Date, D1.Date);

        Assert.Equal(100m, resumen.TotalPendiente);
        Assert.Equal(1, resumen.CantidadPendiente);
        Assert.Equal(0m, resumen.TotalYaLiquidado);
    }

    [Fact]
    public async Task ObtenerResumen_SeparaLoYaLiquidadoDelPendiente()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Juan");
        var idLiquidada = await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 50m);

        var factura = await db.Context.FacturasVentas.FindAsync(idLiquidada);
        Assert.NotNull(factura);
        factura.FechaLiquidacionPropina = DateTime.UtcNow;
        await db.Context.SaveChangesAsync();

        var resumen = await CrearService(db).ObtenerResumenAsync(s.RestauranteId, D1.Date, D1.Date);

        Assert.Equal(0m, resumen.TotalPendiente);
        Assert.Equal(50m, resumen.TotalYaLiquidado);
        Assert.Equal(1, resumen.CantidadYaLiquidado);
    }

    [Fact]
    public async Task PagarPorIgual_ReparteDeFormaExactaEntreTodos()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana");
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Empleado", "Luis");
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100.33m);

        var pago = await CrearService(db).PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");

        Assert.Equal(100.33m, pago.TotalDividir);
        Assert.Equal(2, pago.Detalles.Count);
        Assert.Contains(pago.Detalles, d => Math.Abs(d.Monto - 50.17m) < 0.001m);
        Assert.Contains(pago.Detalles, d => Math.Abs(d.Monto - 50.16m) < 0.001m);
        Assert.Equal(100.33m, pago.Detalles.Sum(d => d.Monto));
        Assert.Equal(ModoRepartoPropina.Igual, pago.Modo);
        Assert.Equal("DOP", pago.Moneda);
    }

    [Fact]
    public async Task PagarPorRol_AplicaPorcentajesPorRol()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana");
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Beto");
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Cocina", "Carla");
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Cocina", "Dani");
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100m);

        var svc = CrearService(db);
        await svc.GuardarConfigAsync(s.RestauranteId, new ConfigPropinaDto
        {
            Modo = ModoRepartoPropina.PorRol,
            RolPorcentajes = new List<RolPorcentajeDto>
            {
                new() { Rol = "Mesero", Porcentaje = 60 },
                new() { Rol = "Cocina", Porcentaje = 40 }
            }
        });

        var pago = await svc.PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");

        Assert.Equal(ModoRepartoPropina.PorRol, pago.Modo);
        Assert.Equal(4, pago.Detalles.Count);
        Assert.Equal(100m, pago.Detalles.Sum(d => d.Monto));
        Assert.Equal(60m, pago.Detalles.Where(d => d.Rol == "Mesero").Sum(d => d.Monto));
        Assert.Equal(40m, pago.Detalles.Where(d => d.Rol == "Cocina").Sum(d => d.Monto));
        Assert.All(pago.Detalles.Where(d => d.Rol == "Mesero"), d => Assert.Equal(30m, d.Monto));
        Assert.All(pago.Detalles.Where(d => d.Rol == "Cocina"), d => Assert.Equal(20m, d.Monto));
    }

    [Fact]
    public async Task PagarPorRol_TresRolesConCentavos_SumaExacta()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana");
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Cocina", "Carla");
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Empleado", "Eva");
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 10.01m);

        var svc = CrearService(db);
        await svc.GuardarConfigAsync(s.RestauranteId, new ConfigPropinaDto
        {
            Modo = ModoRepartoPropina.PorRol,
            RolPorcentajes = new List<RolPorcentajeDto>
            {
                new() { Rol = "Mesero", Porcentaje = 60 },
                new() { Rol = "Cocina", Porcentaje = 30 },
                new() { Rol = "Empleado", Porcentaje = 10 }
            }
        });

        var pago = await svc.PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");

        Assert.Equal(10.01m, pago.Detalles.Sum(d => d.Monto));
    }

    [Fact]
    public async Task PagarPorRol_RedistribuyePorcentajesDeRolesSinPersonal()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        // Solo Empleado y Mesero activos; Cocina configurada al 30% NO tiene miembros.
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana");
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Empleado", "Eva");
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 40m);

        var svc = CrearService(db);
        await svc.GuardarConfigAsync(s.RestauranteId, new ConfigPropinaDto
        {
            Modo = ModoRepartoPropina.PorRol,
            RolPorcentajes = new List<RolPorcentajeDto>
            {
                new() { Rol = "Mesero", Porcentaje = 60 },
                new() { Rol = "Cocina", Porcentaje = 30 },
                new() { Rol = "Empleado", Porcentaje = 10 }
            }
        });

        var pago = await svc.PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");

        Assert.Equal(2, pago.Detalles.Count);
        Assert.Equal(40m, pago.Detalles.Sum(d => d.Monto));
        // 60/10 → peso 70: Mesero 40*60/70=34.29, Empleado 40*10/70=5.71
        Assert.Contains(pago.Detalles, d => d.Rol == "Mesero" && Math.Abs(d.Monto - 34.29m) < 0.001m);
        Assert.Contains(pago.Detalles, d => d.Rol == "Empleado" && Math.Abs(d.Monto - 5.71m) < 0.001m);
    }

    [Fact]
    public async Task PagarMarcaFacturas_EnRangoSiguienteSoloQuedanLasNoLiquidadas()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana");
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1.AddDays(1), 200m);

        var svc = CrearService(db);
        var pago = await svc.PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");

        Assert.Equal(1, pago.CantidadFacturas);
        Assert.Equal(100m, pago.TotalDividir);

        var resumen = await svc.ObtenerResumenAsync(s.RestauranteId, D1.Date, D1.AddDays(1).Date);
        Assert.Equal(200m, resumen.TotalPendiente);
        Assert.Equal(100m, resumen.TotalYaLiquidado);
    }

    [Fact]
    public async Task PagarDosVecesElMismoRango_LanzaSinPendientes()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana");
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100m);

        var svc = CrearService(db);
        await svc.PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            svc.PagarAsync(s.RestauranteId,
                new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin"));
        Assert.Equal(ErrorCodes.SIN_PROPINAS_PENDIENTES, ex.Code);
    }

    [Fact]
    public async Task PagarRangoTraslapado_NoDuplicaLoYaLiquidado()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana");
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100m);

        var svc = CrearService(db);
        await svc.PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            svc.PagarAsync(s.RestauranteId,
                new PagarPropinaDto { Desde = D1.Date, Hasta = D1.AddDays(2).Date }, Guid.NewGuid(), "Admin"));
        Assert.Equal(ErrorCodes.SIN_PROPINAS_PENDIENTES, ex.Code);
    }

    [Fact]
    public async Task PagarSinPersonalActivo_LanzaSinPersonalParaReparto()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100m);

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            CrearService(db).PagarAsync(s.RestauranteId,
                new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin"));
        Assert.Equal(ErrorCodes.SIN_PERSONAL_PARA_REPARTO, ex.Code);
    }

    [Fact]
    public async Task PagarExcluyeUsuariosInactivos()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana", activo: true);
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Inactivo", activo: false);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100m);

        var pago = await CrearService(db).PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");

        Assert.Single(pago.Detalles);
        Assert.Equal(100m, pago.Detalles[0].Monto);
    }

    [Fact]
    public async Task GuardarConfig_PorRolConSumaCero_LanzaErrorYNoCambia()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var svc = CrearService(db);

        await Assert.ThrowsAsync<BusinessException>(() =>
            svc.GuardarConfigAsync(s.RestauranteId, new ConfigPropinaDto
            {
                Modo = ModoRepartoPropina.PorRol,
                RolPorcentajes = new List<RolPorcentajeDto>
                {
                    new() { Rol = "Mesero", Porcentaje = 0 }
                }
            }));

        var config = await svc.ObtenerConfigAsync(s.RestauranteId);
        Assert.Equal(ModoRepartoPropina.Igual, config.Modo);
    }

    [Fact]
    public async Task GuardarConfig_ActualizaModoYRoles()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        var svc = CrearService(db);

        var config = await svc.GuardarConfigAsync(s.RestauranteId, new ConfigPropinaDto
        {
            Modo = ModoRepartoPropina.PorRol,
            RolPorcentajes = new List<RolPorcentajeDto>
            {
                new() { Rol = "Empleado", Porcentaje = 70 },
                new() { Rol = "Mesero", Porcentaje = 30 }
            }
        });

        Assert.Equal(ModoRepartoPropina.PorRol, config.Modo);
        Assert.Equal(2, config.RolPorcentajes.Count);
        Assert.Contains(config.RolPorcentajes, r => r.Rol == "Mesero" && r.Porcentaje == 30m);
        Assert.Contains(config.RolPorcentajes, r => r.Rol == "Empleado" && r.Porcentaje == 70m);
    }

    [Fact]
    public async Task Historial_DevuelvePagosRecientesPrimero()
    {
        using var db = new TestDb();
        var s = await db.SemillarAsync();
        await DbHelpers.CrearUsuarioAsync(db.Context, s.RestauranteId, "Mesero", "Ana");
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1, 100m);
        await DbHelpers.CrearFacturaAsync(db.Context, s.RestauranteId, D1.AddDays(2), 50m);

        var svc = CrearService(db);
        var p1 = await svc.PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.Date, Hasta = D1.Date }, Guid.NewGuid(), "Admin");
        var p2 = await svc.PagarAsync(s.RestauranteId,
            new PagarPropinaDto { Desde = D1.AddDays(2).Date, Hasta = D1.AddDays(2).Date }, Guid.NewGuid(), "Admin");

        var historial = await svc.ObtenerHistorialAsync(s.RestauranteId);
        Assert.Equal(2, historial.Count);
        Assert.Equal(p2.Id, historial[0].Id);
        Assert.Equal(p1.Id, historial[1].Id);
        Assert.Single(historial[0].Detalles);
    }
}