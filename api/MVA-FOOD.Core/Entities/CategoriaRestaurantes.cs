using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class CategoriaRestaurantes
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CategoriaId { get; set; }
        public Categoria Categoria { get; set; } = null!;
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
    }
}