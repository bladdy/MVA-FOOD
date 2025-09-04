using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Filters
{
    public class MenuFilter
    {
        public string Search { get; set; } = string.Empty;
        public Guid? RestauranteId { get; set; }
        public Guid? CategoriaId { get; set; }
        public string OrderBy { get; set; } = "nombre";
        public string OrderDirection { get; set; } = "asc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}