using System;
using System.Collections.Generic;
using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Core.DTOs
{
    public class ConfigPropinaDto
    {
        public ModoRepartoPropina Modo { get; set; } = ModoRepartoPropina.Igual;
        public List<RolPorcentajeDto> RolPorcentajes { get; set; } = new List<RolPorcentajeDto>();
        /// <summary>Cantidad de usuarios activos que participan en el reparto.</summary>
        public int Participantes { get; set; }
        /// <summary>% de propina que se cobra en ventas en mesa (solo informativo).</summary>
        public decimal PorcentajePropina { get; set; }
    }

    public class RolPorcentajeDto
    {
        public string Rol { get; set; } = null!;
        public decimal Porcentaje { get; set; }
    }

    public class ResumenPropinaDto
    {
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
        public string Moneda { get; set; } = "DOP";
        public decimal TotalPendiente { get; set; }
        public int CantidadPendiente { get; set; }
        public decimal TotalYaLiquidado { get; set; }
        public int CantidadYaLiquidado { get; set; }
        /// <summary>Repartición propuesta según la configuración vigente del restaurante.</summary>
        public List<PagoPropinaDetalleDto> Propuesta { get; set; } = new List<PagoPropinaDetalleDto>();
    }

    public class PagarPropinaDto
    {
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
    }

    public class PagoPropinaDto
    {
        public Guid Id { get; set; }
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
        public decimal TotalDividir { get; set; }
        public int CantidadFacturas { get; set; }
        public ModoRepartoPropina Modo { get; set; }
        public string Moneda { get; set; } = "DOP";
        public Guid? UsuarioIdPago { get; set; }
        public string? UsuarioPagoNombre { get; set; }
        public DateTime FechaPago { get; set; }
        public List<PagoPropinaDetalleDto> Detalles { get; set; } = new List<PagoPropinaDetalleDto>();
    }

    public class PagoPropinaDetalleDto
    {
        public Guid? UsuarioId { get; set; }
        public string? Nombre { get; set; }
        public string Rol { get; set; } = null!;
        public decimal Monto { get; set; }
    }
}