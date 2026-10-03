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
        public decimal PorcentajePropina { get; set; }
        public decimal Propina { get; set; }
        public decimal TotalConPropina { get; set; }
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

    /// <summary>Item de un pedido de la cuenta que impide el cierre.</summary>
    public class PedidoItemPendienteDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public int Estado { get; set; }
        public string EstadoNombre { get; set; } = string.Empty;
    }

    /// <summary>Pedido de la cuenta que aún tiene items en curso.</summary>
    public class PedidoPendienteDto
    {
        public Guid Id { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public int? NumeroMesa { get; set; }
        public int Estado { get; set; }
        public string EstadoNombre { get; set; } = string.Empty;
        public List<PedidoItemPendienteDto> Items { get; set; } = new List<PedidoItemPendienteDto>();
    }

    /// <summary>
    /// Resultado de un intento de cierre de cuenta. Valida o devuelve el detalle
    /// de los pedidos que impiden el cierre (PEDIDOS_PENDIENTES).
    /// </summary>
    public class ValidarCierreResponseDto
    {
        public bool PuedeCerrar { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public decimal PorcentajePropina { get; set; }
        public decimal Propina { get; set; }
        public decimal TotalConPropina { get; set; }
        public List<Guid> PedidosFacturables { get; set; } = new List<Guid>();
        public List<PedidoPendienteDto> PedidosPendientes { get; set; } = new List<PedidoPendienteDto>();
    }

    /// <summary>
    /// Respuesta del cierre de cuenta. El código permite al frontend reaccionar:
    /// success=true con facturaVentaId, o un error de negocio concreto.
    /// </summary>
    public class CerrarCuentaResponseDto
    {
        public bool Success { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Guid? FacturaVentaId { get; set; }
        public CuentaMesaDetalleDto? Cuenta { get; set; }
    }
}
