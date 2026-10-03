namespace MVA_FOOD.Core
{
    /// <summary>
    /// Códigos de error de negocio del flujo de pedidos / cuentas / facturación.
    /// El frontend los usa para mostrar mensajes específicos.
    /// </summary>
    public static class ErrorCodes
    {
        public const string CUENTA_NO_ENCONTRADA = "CUENTA_NO_ENCONTRADA";
        public const string CUENTA_YA_CERRADA = "CUENTA_YA_CERRADA";
        public const string CUENTA_INVALIDADA = "CUENTA_INVALIDADA";
        public const string CUENTA_EN_PROCESO_DE_CIERRE = "CUENTA_EN_PROCESO_DE_CIERRE";
        public const string PEDIDOS_PENDIENTES = "PEDIDOS_PENDIENTES";
        public const string PEDIDO_NO_FACTURABLE = "PEDIDO_NO_FACTURABLE";
        public const string PEDIDO_YA_FACTURADO = "PEDIDO_YA_FACTURADO";
        public const string PEDIDO_NO_ENCONTRADO = "PEDIDO_NO_ENCONTRADO";
        public const string MESA_NO_DISPONIBLE = "MESA_NO_DISPONIBLE";
        public const string FACTURA_NO_ENCONTRADA = "FACTURA_NO_ENCONTRADA";
        public const string FACTURA_YA_COBRADA = "FACTURA_YA_COBRADA";
        public const string MONTO_INSUFICIENTE = "MONTO_INSUFICIENTE";
        public const string TRANSICION_NO_PERMITIDA = "TRANSICION_NO_PERMITIDA";
        public const string MESA_NO_OCUPADA = "MESA_NO_OCUPADA";
        public const string RESTAURANTE_NO_ENCONTRADO = "RESTAURANTE_NO_ENCONTRADO";
        public const string SIN_PROPINAS_PENDIENTES = "SIN_PROPINAS_PENDIENTES";
        public const string SIN_PERSONAL_PARA_REPARTO = "SIN_PERSONAL_PARA_REPARTO";
        public const string RANGO_FECHAS_INVALIDO = "RANGO_FECHAS_INVALIDO";
        public const string PORCENTAJES_REPARTO_INVALIDOS = "PORCENTAJES_REPARTO_INVALIDOS";
    }
}