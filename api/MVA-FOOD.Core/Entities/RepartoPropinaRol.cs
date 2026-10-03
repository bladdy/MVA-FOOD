namespace MVA_FOOD.Core.Entities
{
    /// <summary>
    /// Cómo se divide la propina entre el personal: a todos por igual,
    /// o por rol (un % del total por cada rol, repartido entre sus miembros).
    /// </summary>
    public enum ModoRepartoPropina
    {
        Igual = 0,
        PorRol = 1
    }

    /// <summary>
    /// Porcentaje de propina asignado a un rol del restaurante para el modo "PorRol".
    /// </summary>
    public class RepartoPropinaRol
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public string Rol { get; set; } = null!;
        public decimal Porcentaje { get; set; }
    }
}