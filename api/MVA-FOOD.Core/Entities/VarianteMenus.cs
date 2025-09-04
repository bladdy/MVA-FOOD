using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class VarianteMenus
    {
        public Guid Id { get; set; }
        public Guid MenuId { get; set; }
        public Menu Menu { get; set; } = null!;

        public Guid VarianteId { get; set; }
        public Variante Variante { get; set; } = null!;

    }
}