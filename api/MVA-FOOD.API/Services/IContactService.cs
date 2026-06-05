using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.Request;

namespace MVA_FOOD.API.Services
{
    public interface IContactService
    {
        Task SaveAsync(ContactRequest request);
    }
}