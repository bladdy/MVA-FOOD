
using System.ComponentModel.DataAnnotations.Schema;

namespace MVA_FOOD.Core.Entities
{
    public class Pedido
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ClienteNombre { get; set; } = null!;
        public string ClienteTelefono { get; set; } = null!;
        public string TipoEntrega { get; set; } = "recoger";
        public string? Direccion { get; set; }
        public string? MetodoPago { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
        public Estado Estado { get; set; } = Estado.Pendiente;
        public decimal Total { get; set; }
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public Guid? MesaId { get; set; }
        public Mesa? Mesa { get; set; }
        public int? NumeroMesa { get; set; }
        public bool Activo { get; set; } = true;
        public Guid? MeseroUsuarioId { get; set; }
        public string? MeseroNombre { get; set; }
        public Guid? FacturaVentaId { get; set; }
        public FacturaVenta? FacturaVenta { get; set; }
        public Guid? CuentaMesaId { get; set; }
        public CuentaMesa? CuentaMesa { get; set; }
        public List<PedidoItem> Items { get; set; } = new List<PedidoItem>();

        [NotMapped]
        public bool EstaFacturado => FacturaVentaId.HasValue;

        /// <summary>
        /// Un pedido es facturable cuando todos sus items están en un estado final
        /// (Entregado o Cancelado) y al menos uno fue efectivamente entregado.
        /// Requiere que Items esté cargado.
        /// </summary>
        [NotMapped]
        public bool PuedeFacturarse
        {
            get
            {
                if (Items.Count == 0)
                    return false;
                return Items.All(i => i.Estado == Estado.Entregado || i.Estado == Estado.Cancelado)
                    && Items.Any(i => i.Estado == Estado.Entregado);
            }
        }

        public void CalcularTotal()
        {
            Total = Items.Sum(item => item.Precio * item.Cantidad);
        }
    }

    /// <summary>
    /// Estados del pedido y de sus items.
    /// 0 Pendiente, 1 EnPreparacion, 2 Listo, 3 Entregado, 4 Cancelado.
    /// Estados finales: Entregado y Cancelado.
    /// El estado del pedido es derivado del estado de sus items.
    /// </summary>
    public enum Estado
    {
        Pendiente = 0,
        EnPreparacion = 1,
        Listo = 2,
        Entregado = 3,
        Cancelado = 4
    }
}