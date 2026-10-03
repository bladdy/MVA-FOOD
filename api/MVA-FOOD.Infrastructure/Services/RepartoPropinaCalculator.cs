using System;
using System.Collections.Generic;
using System.Linq;

namespace MVA_FOOD.Infrastructure.Services
{
    /// <summary>
    /// Divide el total de propinas entre el personal activo. El reparto siempre
    /// suma exactamente <c>total</c>: los céntimos sobrantes se reparten uno a uno
    /// (largest-remainder) a los primeros participantes.
    /// </summary>
    public static class RepartoPropinaCalculator
    {
        /// <summary>Roles que participan en la división (Admin queda fuera).</summary>
        public static readonly string[] RolesParticipantes = { "Empleado", "Mesero", "Cocina" };

        /// <summary>
        /// Reparte el total en partes iguales entre todos los miembros activos,
        /// o por rol cuando <paramref name="configRoles"/> define porcentajes.
        /// Cada participante recibe su monto como detalle con su rol.
        /// </summary>
        public static List<(Guid? usuarioId, string nombre, string rol, decimal monto)> Repartir(
            decimal total,
            IReadOnlyList<(Guid? usuarioId, string nombre, string rol)> participantes,
            IReadOnlyDictionary<string, decimal> configRoles)
        {
            var resultado = new List<(Guid?, string, string, decimal)>();
            if (total <= 0)
                return resultado;

            var porRol = configRoles.Count > 0;

            if (!porRol)
            {
                var partes = Dividir(total, participantes.Count);
                for (int i = 0; i < participantes.Count; i++)
                    resultado.Add((participantes[i].usuarioId, participantes[i].nombre, participantes[i].rol, partes[i]));
                return resultado;
            }

            // Pool por rol (redondeado) y ajuste del céntimo sobrante al primer rol
            // con miembros, para que la suma total siga siendo exacta. Los porcentajes
            // de roles SIN personal activo no se consideran: su parte se redistribuye
            // proporcionalmente entre los roles que sí tienen miembros.
            var grupos = participantes.GroupBy(p => p.rol)
                .Where(g => configRoles.TryGetValue(g.Key, out var pct) && pct > 0)
                .ToList();
            var totalPeso = grupos.Sum(g => configRoles[g.Key]);
            if (totalPeso <= 0)
                return resultado;
            var pools = new List<(string rol, decimal monto)>();
            foreach (var g in grupos)
            {
                var pct = configRoles[g.Key];
                pools.Add((g.Key, Math.Round(total * pct / totalPeso, 2)));
            }
            var sumaPools = pools.Sum(p => p.monto);
            var diferencia = total - sumaPools;
            if (diferencia != 0m && pools.Count > 0)
                pools[0] = (pools[0].rol, pools[0].monto + diferencia);

            foreach (var p in pools)
            {
                var miembros = grupos.First(g => g.Key == p.rol).ToList();
                var partes = Dividir(p.monto, miembros.Count);
                int i = 0;
                foreach (var m in miembros)
                {
                    resultado.Add((m.usuarioId, m.nombre, m.rol, partes[i]));
                    i++;
                }
            }

            return resultado;
        }

        /// <summary>
        /// Divide un monto en N partes redondeadas a 2 decimales que suman exacto.
        /// </summary>
        private static decimal[] Dividir(decimal monto, int partes)
        {
            if (partes <= 0)
                return Array.Empty<decimal>();

            var totalCentavos = (int)Math.Round(monto * 100m);
            var baseCent = totalCentavos / partes;
            var resto = totalCentavos % partes;

            var resultado = new decimal[partes];
            for (int i = 0; i < partes; i++)
                resultado[i] = (baseCent + (i < resto ? 1 : 0)) / 100m;
            return resultado;
        }
    }
}