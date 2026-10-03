using System.Net;

namespace MVA_FOOD.Core
{
    /// <summary>
    /// Excepción de regla de negocio. Lleva un código estable (ErrorCodes)
    /// que el frontend puede interpretar, y un mensaje legible.
    /// El ExceptionMiddleware la traduce a una respuesta HTTP con
    /// StatusCode, el código y el mensaje.
    /// </summary>
    public class BusinessException : Exception
    {
        public string Code { get; }
        public HttpStatusCode StatusCode { get; }

        public BusinessException(string code, string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
            : base(message)
        {
            Code = code;
            StatusCode = statusCode;
        }
    }
}