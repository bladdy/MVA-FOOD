using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using MVA_FOOD.Core.Request;
using MVA_FOOD.API.Services;

namespace MVA_FOOD.API.Services;
public class ContactService : IContactService
{
    private readonly IConfiguration _configuration;

    public ContactService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SaveAsync(ContactRequest request)
    {
        var credential = GoogleCredential
            .FromFile("google-service-account.json")
            .CreateScoped(SheetsService.Scope.Spreadsheets);

        var sheetsService = new SheetsService(
            new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "MrMenus"
            });

        var values = new List<object>
        {
            DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss"),
            request.FromName,
            request.FromLastName,
            request.ReplyTo,
            request.ReplyPhone,
            request.Message
        };

        var body = new ValueRange
        {
            Values = new List<IList<object>>
            {
                values
            }
        };

        var appendRequest =
            sheetsService.Spreadsheets.Values.Append(
                body,
                "1TvuXhFfBXuwivEQ3ctw-CmpUUdPMiGqVLe_aBgGaNcs",
                "Sheet1!A:F");

        appendRequest.ValueInputOption =
            SpreadsheetsResource.ValuesResource.AppendRequest
                .ValueInputOptionEnum.USERENTERED;

        await appendRequest.ExecuteAsync();
    }
}