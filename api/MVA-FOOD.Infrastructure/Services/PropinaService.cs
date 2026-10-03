using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    /// <summary>
    /// Módulo de propinas: configuración del reparto (igual / por rol), consulta
    /// de propinas por rango de fechas y liquidación (marcar un rango como pagado).
    /// Al liquidar se marcan las FacturaVenta incluidas (FechaLiquidacionPropina),
    /// de modo que un mismo periodo nunca se paga dos veces aunque los rangos
    /// se traslapen.
    /// </summary>
    public class PropinaService : IPropinaService
    {
        private readonly AppDbContext _context;

        public PropinaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ConfigPropinaDto> ObtenerConfigAsync(Guid restauranteId)
        {
            var restaurante = await _context.Restaurantes
                .Include(r => r.RepartoPropinaRoles)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == restauranteId)
                ?? throw new BusinessException(ErrorCodes.RESTAURANTE_NO_ENCONTRADO, "El restaurante no existe.");

            var participantes = await _context.Usuarios
                .AsNoTracking()
                .CountAsync(u => u.RestauranteId == restauranteId && u.Activo
                    && RepartoPropinaCalculator.RolesParticipantes.Contains(u.Rol));

            return new ConfigPropinaDto
            {
                Modo = restaurante.ModoRepartoPropina,
                PorcentajePropina = restaurante.PorcentajePropina,
                Participantes = participantes,
                RolPorcentajes = restaurante.RepartoPropinaRoles
                    .OrderBy(r => r.Rol)
                    .Select(r => new RolPorcentajeDto { Rol = r.Rol, Porcentaje = r.Porcentaje })
                    .ToList()
            };
        }

        public async Task<ConfigPropinaDto> GuardarConfigAsync(Guid restauranteId, ConfigPropinaDto dto)
        {
            var restaurante = await _context.Restaurantes
                .Include(r => r.RepartoPropinaRoles)
                .FirstOrDefaultAsync(r => r.Id == restauranteId)
                ?? throw new BusinessException(ErrorCodes.RESTAURANTE_NO_ENCONTRADO, "El restaurante no existe.");

            var roles = (dto.RolPorcentajes ?? new List<RolPorcentajeDto>())
                .Where(r => !string.IsNullOrWhiteSpace(r.Rol))
                .ToList();

            if (roles.Any(r => r.Porcentaje < 0))
                throw new BusinessException(ErrorCodes.PORCENTAJES_REPARTO_INVALIDOS, "Los porcentajes no pueden ser negativos.");

            if (dto.Modo == ModoRepartoPropina.PorRol && roles.Sum(r => r.Porcentaje) <= 0)
                throw new BusinessException(ErrorCodes.PORCENTAJES_REPARTO_INVALIDOS, "Debe asignar al menos un porcentaje para el modo por rol.");

            restaurante.ModoRepartoPropina = dto.Modo;
            _context.RepartoPropinaRoles.RemoveRange(restaurante.RepartoPropinaRoles);

            foreach (var r in roles.Where(r => r.Porcentaje > 0))
            {
                _context.RepartoPropinaRoles.Add(new RepartoPropinaRol
                {
                    RestauranteId = restauranteId,
                    Rol = r.Rol,
                    Porcentaje = r.Porcentaje
                });
            }

            await _context.SaveChangesAsync();
            return await ObtenerConfigAsync(restauranteId);
        }

        public async Task<ResumenPropinaDto> ObtenerResumenAsync(Guid restauranteId, DateTime desde, DateTime hasta)
        {
            ValidarRango(desde, hasta);
            var desdeInicio = desde.Date;
            var hastaExclusivo = hasta.Date.AddDays(1);

            var facturas = await _context.FacturasVentas
                .AsNoTracking()
                .Where(f => f.RestauranteId == restauranteId
                    && f.Estado != EstadoFacturaVenta.Anulada
                    && f.Propina > 0
                    && f.FechaEmision >= desdeInicio
                    && f.FechaEmision < hastaExclusivo)
                .ToListAsync();

            var pendientes = facturas.Where(f => f.FechaLiquidacionPropina == null).ToList();
            var liquidadas = facturas.Where(f => f.FechaLiquidacionPropina != null).ToList();
            var moneda = facturas.FirstOrDefault()?.Moneda ?? "DOP";

            var propuesta = await RepartirAsync(restauranteId, pendientes.Sum(f => f.Propina));
            if (pendientes.Count == 0)
                propuesta = new List<PagoPropinaDetalleDto>();

            return new ResumenPropinaDto
            {
                Desde = desdeInicio,
                Hasta = hasta.Date,
                Moneda = moneda,
                TotalPendiente = pendientes.Sum(f => f.Propina),
                CantidadPendiente = pendientes.Count,
                TotalYaLiquidado = liquidadas.Sum(f => f.Propina),
                CantidadYaLiquidado = liquidadas.Count,
                Propuesta = propuesta
            };
        }

        public async Task<PagoPropinaDto> PagarAsync(Guid restauranteId, PagarPropinaDto dto, Guid usuarioId, string? usuarioNombre)
        {
            ValidarRango(dto.Desde, dto.Hasta);
            var desdeInicio = dto.Desde.Date;
            var hastaExclusivo = dto.Hasta.Date.AddDays(1);

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var pendientes = await _context.FacturasVentas
                .Where(f => f.RestauranteId == restauranteId
                    && f.Estado != EstadoFacturaVenta.Anulada
                    && f.Propina > 0
                    && f.FechaLiquidacionPropina == null
                    && f.FechaEmision >= desdeInicio
                    && f.FechaEmision < hastaExclusivo)
                .ToListAsync();

            if (pendientes.Count == 0)
                throw new BusinessException(ErrorCodes.SIN_PROPINAS_PENDIENTES, "No hay propinas pendientes en el rango indicado.");

            var total = pendientes.Sum(f => f.Propina);
            var detalles = await RepartirAsync(restauranteId, total);
            if (detalles.Count == 0)
                throw new BusinessException(ErrorCodes.SIN_PERSONAL_PARA_REPARTO, "No hay personal activo para repartir la propina.");

            var restaurante = await _context.Restaurantes.FindAsync(restauranteId);
            var pago = new PagoPropina
            {
                RestauranteId = restauranteId,
                Desde = desdeInicio,
                Hasta = dto.Hasta.Date,
                TotalDividir = total,
                CantidadFacturas = pendientes.Count,
                Modo = restaurante?.ModoRepartoPropina ?? ModoRepartoPropina.Igual,
                Moneda = pendientes.FirstOrDefault()?.Moneda ?? "DOP",
                UsuarioIdPago = usuarioId,
                UsuarioPagoNombre = usuarioNombre,
                FechaPago = DateTime.UtcNow,
                Detalles = detalles.Select(d => new PagoPropinaDetalle
                {
                    UsuarioId = d.UsuarioId,
                    Nombre = d.Nombre,
                    Rol = d.Rol,
                    Monto = d.Monto
                }).ToList()
            };

            _context.PagosPropina.Add(pago);

            foreach (var f in pendientes)
            {
                f.PagoPropinaId = pago.Id;
                f.FechaLiquidacionPropina = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapPago(pago);
        }

        public async Task<List<PagoPropinaDto>> ObtenerHistorialAsync(Guid restauranteId)
        {
            var pagos = await _context.PagosPropina
                .Include(p => p.Detalles)
                .Where(p => p.RestauranteId == restauranteId)
                .OrderByDescending(p => p.FechaPago)
                .AsNoTracking()
                .ToListAsync();

            return pagos.Select(MapPago).ToList();
        }

        public async Task<PagoPropinaDto?> ObtenerDetalleAsync(Guid id, Guid restauranteId)
        {
            var pago = await _context.PagosPropina
                .Include(p => p.Detalles)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id && p.RestauranteId == restauranteId);

            return pago == null ? null : MapPago(pago);
        }

        private async Task<List<PagoPropinaDetalleDto>> RepartirAsync(Guid restauranteId, decimal total)
        {
            if (total <= 0)
                return new List<PagoPropinaDetalleDto>();

            var participantes = await _context.Usuarios
                .AsNoTracking()
                .Where(u => u.RestauranteId == restauranteId && u.Activo
                    && RepartoPropinaCalculator.RolesParticipantes.Contains(u.Rol))
                .Select(u => new { u.Id, u.Nombre, u.Rol })
                .ToListAsync();

            if (participantes.Count == 0)
                return new List<PagoPropinaDetalleDto>();

            var configRoles = await _context.RepartoPropinaRoles
                .AsNoTracking()
                .Where(r => r.RestauranteId == restauranteId)
                .ToDictionaryAsync(r => r.Rol, r => r.Porcentaje);

            var reparto = RepartoPropinaCalculator.Repartir(
                total,
                participantes.Select(p => ((Guid?)p.Id, p.Nombre, p.Rol)).ToList(),
                configRoles);

            return reparto
                .Select(r => new PagoPropinaDetalleDto
                {
                    UsuarioId = r.usuarioId,
                    Nombre = r.nombre,
                    Rol = r.rol,
                    Monto = r.monto
                })
                .ToList();
        }

        private static PagoPropinaDto MapPago(PagoPropina p)
        {
            return new PagoPropinaDto
            {
                Id = p.Id,
                Desde = p.Desde,
                Hasta = p.Hasta,
                TotalDividir = p.TotalDividir,
                CantidadFacturas = p.CantidadFacturas,
                Modo = p.Modo,
                Moneda = p.Moneda,
                UsuarioIdPago = p.UsuarioIdPago,
                UsuarioPagoNombre = p.UsuarioPagoNombre,
                FechaPago = p.FechaPago,
                Detalles = p.Detalles
                    .Select(d => new PagoPropinaDetalleDto
                    {
                        UsuarioId = d.UsuarioId,
                        Nombre = d.Nombre,
                        Rol = d.Rol,
                        Monto = d.Monto
                    })
                    .OrderByDescending(d => d.Monto)
                    .ThenBy(d => d.Nombre)
                    .ToList()
            };
        }

        private static void ValidarRango(DateTime desde, DateTime hasta)
        {
            if (desde > hasta)
                throw new BusinessException(ErrorCodes.RANGO_FECHAS_INVALIDO, "La fecha inicial no puede ser mayor que la final.");
        }
    }
}