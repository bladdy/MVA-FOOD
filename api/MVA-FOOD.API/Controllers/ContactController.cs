using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.API.Services;
using MVA_FOOD.Core.Request;
using MVA_FOOD.Core.Responses;

namespace MVA_FOOD.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactController(
        IContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpPost]
    public async Task<IActionResult> Post(
        [FromBody] ContactRequest request)
    {
        try
        {
            await _contactService.SaveAsync(request);

            return Ok(new ContactResponse
            {
                Success = true
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500,
                new ContactResponse
                {
                    Success = false,
                    Error = ex.Message
                });
        }
    }
}