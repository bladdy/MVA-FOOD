using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class GoogleSheetsSettings
    {
        public string SpreadsheetId { get; set; } = string.Empty;
    public string CredentialsJson { get; set; } = string.Empty;
    }
}