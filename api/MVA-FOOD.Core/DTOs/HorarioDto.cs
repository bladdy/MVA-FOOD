using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class HorarioDto
    {
        public Guid Id { get; set; }
        public DayOfWeek Dia { get; set; }
        public TimeSpan HoraApertura { get; set; }
        public TimeSpan HoraCierre { get; set; }
        // ✅ Formato de hora en 12 horas (ej: "08:30 AM", "05:45 PM")
        public string HoraAperturaTexto => DateTime.Today
            .Add(HoraApertura)
            .ToString("hh:mm tt", CultureInfo.InvariantCulture);

        public string HoraCierreTexto => DateTime.Today
            .Add(HoraCierre)
            .ToString("hh:mm tt", CultureInfo.InvariantCulture);
        // ✅ Devuelve el día de la semana en español
        public string DiaTexto => CultureInfo
            .GetCultureInfo("es-ES")
            .DateTimeFormat
            .GetDayName(Dia)
            .CapitalizeFirstLetter();
    }
    // ✅ Método de extensión para capitalizar la primera letra
    public static class StringExtensions
    {
        public static string CapitalizeFirstLetter(this string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            return char.ToUpper(input[0]) + input.Substring(1);
        }
    }

}