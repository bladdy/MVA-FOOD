namespace MVA_FOOD.Core.Interfaces
{
    public class CheckoutSessionResult
    {
        public string SessionId { get; set; } = null!;
        public string Url { get; set; } = null!;
    }

    public class SessionVerificationResult
    {
        public bool IsPaid { get; set; }
        public string SessionId { get; set; } = null!;
        public string? RestauranteId { get; set; }
        public string? PlanId { get; set; }
        public string? FacturaId { get; set; }
        public string? Monto { get; set; }
        public string? Moneda { get; set; }
    }

    public interface IStripePaymentService
    {
        Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
            decimal monto,
            string moneda,
            string concepto,
            string successUrl,
            string cancelUrl,
            Dictionary<string, string> metadata);

        Task<SessionVerificationResult> VerifyCheckoutSessionAsync(string sessionId);
        Task<SessionVerificationResult?> ParseWebhookEventAsync(string json, string signature);
    }
}
