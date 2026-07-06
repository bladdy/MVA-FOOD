namespace MVA_FOOD.Core.Interfaces
{
    public interface ITipoCambioService
    {
        Task<decimal> GetTasaUsdAsync(string monedaDestino);
    }
}
