using System.Net.Http;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Services
{
    public class TipoCambioService : ITipoCambioService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(6);

        private static readonly Dictionary<string, decimal> FallbackRates = new()
        {
            { "DOP", 58m },
            { "MXN", 20m },
            { "USD", 1m }
        };

        public TipoCambioService(IHttpClientFactory httpClientFactory, IMemoryCache cache)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
        }

        public async Task<decimal> GetTasaUsdAsync(string monedaDestino)
        {
            if (monedaDestino == "USD") return 1m;

            var cacheKey = $"tasa_usd_{monedaDestino}";
            if (_cache.TryGetValue(cacheKey, out decimal tasa))
                return tasa;

            try
            {
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync($"https://open.er-api.com/v6/latest/USD");
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var rates = doc.RootElement.GetProperty("rates");

                if (rates.TryGetProperty(monedaDestino, out var rateElement))
                {
                    tasa = rateElement.GetDecimal();
                }
                else
                {
                    tasa = FallbackRates.GetValueOrDefault(monedaDestino, 1m);
                }
            }
            catch
            {
                tasa = FallbackRates.GetValueOrDefault(monedaDestino, 1m);
            }

            _cache.Set(cacheKey, tasa, CacheDuration);
            return tasa;
        }
    }
}
