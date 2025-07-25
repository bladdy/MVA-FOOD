using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class PedidoItem
    {
        public Guid Id { get; set; }

        public Guid MenuId { get; set; }
        public Menu Producto { get; set; } = null!;

        public int Cantidad { get; set; }
        public string Notas { get; set; }
    }

}