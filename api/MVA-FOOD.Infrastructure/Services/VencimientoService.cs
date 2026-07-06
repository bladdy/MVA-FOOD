using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class VencimientoService : IVencimientoService
    {
        private readonly AppDbContext _context;
        private readonly ITipoCambioService _tipoCambioService;

        public VencimientoService(AppDbContext context, ITipoCambioService tipoCambioService)
        {
            _context = context;
            _tipoCambioService = tipoCambioService;
        }

        public async Task<int> GenerarFacturasVencidasAsync()
        {
            var ahora = DateTime.UtcNow;
            var count = 0;

            var planesARenovar = await _context.PlanesRestaurantes
                .Include(pr => pr.Plan)
                .Where(pr => pr.Estado == "Activo" && pr.FechaFin <= ahora && pr.Plan.Precio > 0)
                .ToListAsync();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                foreach (var pr in planesARenovar)
                {
                    var rest = await _context.Restaurantes.FindAsync(pr.RestauranteId);
                    var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");
                    var tasa = await _tipoCambioService.GetTasaUsdAsync(moneda);
                    var montoLocal = Math.Round(pr.Plan.Precio * tasa, 2);

                    var factura = new Factura
                    {
                        RestauranteId = pr.RestauranteId,
                        PlanRestauranteId = pr.Id,
                        NumeroFactura = $"FAC-{pr.RestauranteId.ToString("N")[..8].ToUpper()}-{(await _context.Facturas.CountAsync(f => f.RestauranteId == pr.RestauranteId) + 1):D4}",
                        Monto = montoLocal,
                        FechaEmision = ahora,
                        Pagado = false,
                        Concepto = $"Plan {pr.Plan.Nombre} - Renovación",
                        Moneda = moneda
                    };

                    _context.Facturas.Add(factura);
                    pr.FechaFin = ahora.AddDays(pr.Plan.DuracionDias);
                    count++;
                }

                if (count > 0)
                    await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return count;
        }

        public async Task<int> DesactivarPlanesVencidosAsync()
        {
            var ahora = DateTime.UtcNow;
            var count = 0;

            var planesVencidos = await _context.PlanesRestaurantes
                .Include(pr => pr.Plan)
                .Include(pr => pr.Facturas)
                .Where(pr => pr.Estado == "Activo"
                    && pr.Plan.Precio > 0
                    && pr.Facturas.Any(f => !f.Pagado && f.FechaEmision.AddDays(2) <= ahora))
                .ToListAsync();

            if (planesVencidos.Count == 0) return 0;

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                foreach (var pr in planesVencidos)
                {
                    pr.Estado = "Vencido";
                    count++;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return count;
        }
    }
}
