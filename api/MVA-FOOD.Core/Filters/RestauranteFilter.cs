using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Filters
{
    public class RestauranteFilter
    {
        public string? Search { get; set; }
        public Guid? TipoId { get; set; }
        public Guid? AmenidadId { get; set; }
        public string? Ubicacion { get; set; }

        public string? OrderBy { get; set; } = "nombre"; 
        public string OrderDirection { get; set; } = "asc";

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}