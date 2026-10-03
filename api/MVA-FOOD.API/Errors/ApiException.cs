using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.API.Errors
{
    public class ApiException : ApiResponse
    {
        public ApiException(int statusCode, string message = null, string details = null, string code = null) 
            : base(statusCode, message)
        {
            Details = details;
            Code = code;
        }

        public string Details { get; set; }
        public string Code { get; set; }
    }
}