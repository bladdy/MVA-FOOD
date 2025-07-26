using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Pedido
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ClienteNombre { get; set; } = null!;
        public string ClienteTelefono { get; set; } = null!;
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
        public Estado Estado { get; set; } = Estado.Pendiente;
        public decimal Total { get; set; }
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public Guid MesaId { get; set; }
        public Mesa Mesa { get; set; } = null!;
        public Guid EmpleadoId { get; set; }
        public Empleado Empleado { get; set; } = null!;
        public List<PedidoItem> Items { get; set; } = new List<PedidoItem>();

        public void CalcularTotal()
        {
            Total = Items.Sum(item => item.Precio * item.Cantidad);
        }
    }
    public enum Estado { Pendiente, EnProceso, Completado }
}