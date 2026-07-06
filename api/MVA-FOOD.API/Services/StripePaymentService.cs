using MVA_FOOD.Core.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace MVA_FOOD.API.Services
{
    public class StripePaymentService : IStripePaymentService
    {
        private readonly IConfiguration _configuration;

        public StripePaymentService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
            decimal monto,
            string moneda,
            string concepto,
            string successUrl,
            string cancelUrl,
            Dictionary<string, string> metadata)
        {
            var options = new SessionCreateOptions
            {
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = moneda.ToLowerInvariant(),
                            UnitAmount = (long)(monto * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = concepto,
                            }
                        }
                    }
                },
                Mode = "payment",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Metadata = metadata
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);
            return new CheckoutSessionResult
            {
                SessionId = session.Id,
                Url = session.Url
            };
        }

        public async Task<SessionVerificationResult> VerifyCheckoutSessionAsync(string sessionId)
        {
            try
            {
                var service = new SessionService();
                var session = await service.GetAsync(sessionId);

                return new SessionVerificationResult
                {
                    IsPaid = session.PaymentStatus == "paid",
                    SessionId = session.Id,
                    RestauranteId = session.Metadata.GetValueOrDefault("restauranteId"),
                    PlanId = session.Metadata.GetValueOrDefault("planId"),
                    FacturaId = session.Metadata.GetValueOrDefault("facturaId"),
                    Monto = session.Metadata.GetValueOrDefault("monto"),
                    Moneda = session.Metadata.GetValueOrDefault("moneda")
                };
            }
            catch
            {
                return new SessionVerificationResult { IsPaid = false };
            }
        }

        public async Task<SessionVerificationResult?> ParseWebhookEventAsync(string json, string signature)
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"]
                ?? throw new InvalidOperationException("Stripe:WebhookSecret no configurado");

            var stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret, throwOnApiVersionMismatch: false);

            if (stripeEvent.Type != EventTypes.CheckoutSessionCompleted)
                return null;

            var session = stripeEvent.Data.Object as Session;
            if (session == null)
                return new SessionVerificationResult { IsPaid = false };

            return new SessionVerificationResult
            {
                IsPaid = session.PaymentStatus == "paid",
                SessionId = session.Id,
                RestauranteId = session.Metadata.GetValueOrDefault("restauranteId"),
                PlanId = session.Metadata.GetValueOrDefault("planId"),
                FacturaId = session.Metadata.GetValueOrDefault("facturaId"),
                Monto = session.Metadata.GetValueOrDefault("monto"),
                Moneda = session.Metadata.GetValueOrDefault("moneda")
            };
        }
    }
}
