namespace MVA_FOOD.Core
{
    public static class MonedaHelper
    {
        public static string PaisToMoneda(string pais) => pais switch
        {
            "US" => "USD",
            "MX" => "MXN",
            "DO" => "DOP",
            _ => "DOP"
        };

        public static string MonedaToSimbolo(string moneda) => moneda switch
        {
            "USD" => "$",
            "MXN" => "MX$",
            "DOP" => "RD$",
            _ => "$"
        };
    }
}
