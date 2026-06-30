using Microsoft.AspNetCore.Http;

namespace MVA_FOOD.Core.DTOs
{
    public class ComboCreateDto
    {
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal? Precio { get; set; }
        public bool Activo { get; set; } = true;
        public bool Predefinido { get; set; } = true;
        public Guid RestauranteId { get; set; }
        public IFormFile? ImagenFile { get; set; }
        public string? ImagenUrl { get; set; }
        public List<ComboItemCreateDto> Items { get; set; } = new();
        public List<ComboSugeridoCreateDto>? Sugerencias { get; set; }
    }

    public class ComboItemCreateDto
    {
        public Guid MenuId { get; set; }
        public int Cantidad { get; set; } = 1;
    }

    public class ComboSugeridoCreateDto
    {
        public Guid MenuId { get; set; }
        public decimal PrecioAdicional { get; set; }
    }
}
