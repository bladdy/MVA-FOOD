namespace MVA_FOOD.Core.DTOs
{
    public class CuentaMesaItemDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal Precio { get; set; }
        public string Opciones { get; set; } = string.Empty;
        public bool EsCombo { get; set; }
        public string? ComboNombre { get; set; }
        public string? ComboItemsJson { get; set; }
    }

    public class CuentaMesaPedidoDto
    {
        public Guid Id { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public int Estado { get; set; }
        public decimal Total { get; set; }
        public int CantidadItems { get; set; }
    }

    public class CuentaMesaDetalleDto
    {
        public Guid Id { get; set; }
        public Guid RestauranteId { get; set; }
        public Guid MesaId { get; set; }
        public int NumeroMesa { get; set; }
        public int Estado { get; set; }
        public DateTime FechaApertura { get; set; }
        public DateTime? FechaCierre { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteTelefono { get; set; } = string.Empty;
        public string? MetodoPago { get; set; }
        public string TipoEntrega { get; set; } = "en mesa";
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public Guid? FacturaVentaId { get; set; }
        public int CantidadPedidos { get; set; }
        public List<CuentaMesaPedidoDto> Pedidos { get; set; } = new List<CuentaMesaPedidoDto>();
        public List<CuentaMesaItemDto> Items { get; set; } = new List<CuentaMesaItemDto>();
    }

    public class CerrarCuentaMesaDto
    {
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteTelefono { get; set; } = string.Empty;
        public string? ClienteNumeroFiscal { get; set; }
        public string TipoEntrega { get; set; } = "en mesa";
        public string? MetodoPago { get; set; }
        public string? Nota { get; set; }
    }
}
