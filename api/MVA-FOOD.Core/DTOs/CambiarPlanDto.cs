namespace MVA_FOOD.Core.DTOs
{
    public class CambiarPlanDto
    {
        public Guid RestauranteId { get; set; }
        public Guid NuevoPlanId { get; set; }
    }

    public class CrearCheckoutDto
    {
        public Guid RestauranteId { get; set; }
        public Guid NuevoPlanId { get; set; }
    }

    public class CrearCheckoutResponseDto
    {
        public string CheckoutUrl { get; set; } = null!;
        public string SessionId { get; set; } = null!;
    }

    public class CambioPlanResponseDto
    {
        public bool RequierePago { get; set; }
        public string? CheckoutUrl { get; set; }
        public string Mensaje { get; set; } = null!;
    }
}
