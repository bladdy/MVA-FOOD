using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using MVA_FOOD.Core.Request;
using MVA_FOOD.Core.DTOs;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace MVA_FOOD.API.Services;
public class ContactService : IContactService
{
    private readonly GoogleSheetsSettings _settings;

    public ContactService(
        IOptions<GoogleSheetsSettings> options)
    {
        _settings = options.Value;
    }

    public async Task SaveAsync(ContactRequest request)
    {
        var credentials = new
        {
            type = "service_account",
            project_id = _settings.ProjectId,
            private_key_id = _settings.PrivateKeyId,
            private_key = _settings.PrivateKey,
            client_email = _settings.ClientEmail,
            client_id = _settings.ClientId,
            auth_uri = "https://accounts.google.com/o/oauth2/auth",
            token_uri = "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
        };

        var credential = GoogleCredential
            .FromJson(JsonSerializer.Serialize(credentials))
            .CreateScoped(SheetsService.Scope.Spreadsheets);

        var sheetsService = new SheetsService(
            new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "MrMenus"
            });

        var values = new List<object>
        {
            DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            request.FromName,
            request.FromLastName,
            request.ReplyTo,
            request.ReplyPhone,
            request.Message
        };

        var valueRange = new ValueRange
        {
            Values = new List<IList<object>>
            {
                values
            }
        };

        var appendRequest =
            sheetsService.Spreadsheets.Values.Append(
                valueRange,
                _settings.SpreadsheetId,
                "Sheet1!A:F");

        appendRequest.ValueInputOption =
            SpreadsheetsResource.ValuesResource.AppendRequest
                .ValueInputOptionEnum.USERENTERED;

        await appendRequest.ExecuteAsync();
    }
}