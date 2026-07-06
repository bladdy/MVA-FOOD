using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Services
{
    public class RenovacionHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<RenovacionHostedService> _logger;

        public RenovacionHostedService(IServiceScopeFactory scopeFactory, ILogger<RenovacionHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var service = scope.ServiceProvider.GetRequiredService<IVencimientoService>();

                        var generadas = await service.GenerarFacturasVencidasAsync();
                        if (generadas > 0)
                            _logger.LogInformation("Generadas {Count} facturas de renovación", generadas);

                        var desactivados = await service.DesactivarPlanesVencidosAsync();
                        if (desactivados > 0)
                            _logger.LogInformation("Desactivados {Count} planes por falta de pago", desactivados);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error en RenovacionHostedService");
                }

                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }
}
