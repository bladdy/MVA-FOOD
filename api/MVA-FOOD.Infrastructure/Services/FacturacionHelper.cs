using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Infrastructure.Services
{
    /// <summary>
    /// Cálculos compartidos de facturación entre FacturaVentaService y CuentaMesaService
    /// para que el total mostrado en la cuenta y el ticket final sean consistentes.
    /// </summary>
    public static class FacturacionHelper
    {
        /// <summary>
        /// La propina aplica solo a entregas en mesa ("en mesa" / "para comer aquí"):
        /// es un % del subtotal, se suma al total para el cobro final (TotalConPropina)
        /// sin alterar <c>total</c> (que conserva su semántica para reportes).
        /// </summary>
        public static (decimal porcentaje, decimal propina, decimal totalConPropina) CalcularPropina(
            Restaurante rest, string tipoEntrega, decimal subtotal, decimal total)
        {
            var t = (tipoEntrega ?? "").Trim().ToLowerInvariant();
            bool aplica = rest.PorcentajePropina > 0
                && (t == "en mesa" || t == "para comer aquí" || t == "para comer aqui" || t.Contains("mesa"));

            if (!aplica)
                return (0m, 0m, total);

            var propina = Math.Round(subtotal * rest.PorcentajePropina / 100m, 2);
            return (rest.PorcentajePropina, propina, total + propina);
        }
    }
}