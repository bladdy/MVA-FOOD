using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.API.Errors
{
    public class ApiValidationErrorResponse: ApiResponse
    {
        public ApiValidationErrorResponse() : base(400)
        {
        }
        private IEnumerable<string> errors;

        public IEnumerable<string> GetErrors()
        {
            return errors;
        }

        public void SetErrors(IEnumerable<string> value)
        {
            errors = value;
        }
    }
}