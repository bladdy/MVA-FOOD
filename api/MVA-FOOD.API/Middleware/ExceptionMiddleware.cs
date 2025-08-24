using System.Net;
using System.Text.Json;
using MVA_FOOD.API.Errors;

namespace MVA_FOOD.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;
        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger,
            IHostEnvironment env)
        {
            _env = env;
            _logger = logger;
            _next = next;
        }
        /*public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context); // Ejecuta el siguiente middleware
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocurrió un error no manejado");

                context.Response.ContentType = "application/json";

                switch (ex)
                {
                    case KeyNotFoundException:
                        context.Response.StatusCode = StatusCodes.Status404NotFound;
                        break;
                    case ArgumentException:
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        break;
                    default:
                        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                        break;
                }

                var result = JsonSerializer.Serialize(new
                {
                    mensaje = ex.Message
                });

                await context.Response.WriteAsync(result);
            }
        }*/
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                var response = _env.IsDevelopment()
                    ? new ApiException((int)HttpStatusCode.InternalServerError, ex.Message, ex.StackTrace.ToString())
                    : new ApiException((int)HttpStatusCode.InternalServerError, ex.Message, "Internal Server Error");

                var options = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase};

                var json = JsonSerializer.Serialize(response, options);

                await context.Response.WriteAsync(json);
            }
        }
    }
}