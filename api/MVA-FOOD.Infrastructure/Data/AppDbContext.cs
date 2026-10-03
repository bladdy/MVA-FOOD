using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Amenidad> Amenidades { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Restaurante> Restaurantes { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<Mesa> Mesas { get; set; }
        public DbSet<CuentaMesa> CuentasMesas { get; set; }
        public DbSet<Horario> Horarios { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<Plan> Planes { get; set; }
        public DbSet<PlanRestaurante> PlanesRestaurantes { get; set; }
        public DbSet<Variante> Variantes { get; set; }
        public DbSet<VarianteOpcion> VarianteOpciones { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<PedidoItem> PedidoItems { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<AmenidadRestaurantes> AmenidadRestaurantes { get; set; }
        public DbSet<CategoriaRestaurantes> CategoriaRestaurantes { get; set; }
        public DbSet<VarianteMenus> VarianteMenus { get; set; }
        public DbSet<Combo> Combos { get; set; }
        public DbSet<ComboMenu> ComboMenus { get; set; }
        public DbSet<MenuComboSugerido> MenuComboSugeridos { get; set; }
        public DbSet<TipoEntregaRestaurante> TiposEntregaRestaurante { get; set; }
        public DbSet<MetodoPagoRestaurante> MetodosPagoRestaurante { get; set; }
        public DbSet<Factura> Facturas { get; set; }
        public DbSet<FacturaVenta> FacturasVentas { get; set; }
        public DbSet<FacturaVentaItem> FacturaVentaItems { get; set; }
        public DbSet<Permiso> Permisos { get; set; }
        public DbSet<RolPermiso> RolPermisos { get; set; }
        public DbSet<RepartoPropinaRol> RepartoPropinaRoles { get; set; }
        public DbSet<PagoPropina> PagosPropina { get; set; }
        public DbSet<PagoPropinaDetalle> PagosPropinaDetalles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Restaurante>()
                .HasIndex(r => r.Name).IsUnique();

            modelBuilder.Entity<Restaurante>()
                .HasOne(r => r.PlanRestaurante)
                .WithOne(pr => pr.Restaurante)
                .HasForeignKey<PlanRestaurante>(pr => pr.RestauranteId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Variante>()
                .HasOne(v => v.Restaurante)
                .WithMany()
                .HasForeignKey(v => v.RestauranteId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<VarianteMenus>()
                .HasOne(vm => vm.Variante)
                .WithMany(v => v.MenuVariantes)
                .HasForeignKey(vm => vm.VarianteId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Menu>()
                .HasOne(m => m.Categoria)
                .WithMany(c => c.Menus)
                .OnDelete(DeleteBehavior.Cascade)
                .HasForeignKey(m => m.CategoriaId);

            modelBuilder.Entity<ComboMenu>()
                .HasOne(cm => cm.Combo)
                .WithMany(c => c.Items)
                .HasForeignKey(cm => cm.ComboId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ComboMenu>()
                .HasOne(cm => cm.Menu)
                .WithMany()
                .HasForeignKey(cm => cm.MenuId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MenuComboSugerido>()
                .HasOne(mcs => mcs.Combo)
                .WithMany(c => c.Sugerencias)
                .HasForeignKey(mcs => mcs.ComboId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MenuComboSugerido>()
                .HasOne(mcs => mcs.Menu)
                .WithMany()
                .HasForeignKey(mcs => mcs.MenuId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PedidoItem>()
                .HasOne(pi => pi.Producto)
                .WithMany()
                .HasForeignKey(pi => pi.MenuId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Pedido>()
                .Property(p => p.Fecha)
                .HasConversion(
                    v => v.ToString("O"),
                    v => DateTime.SpecifyKind(
                        DateTime.Parse(v, null, DateTimeStyles.RoundtripKind),
                        DateTimeKind.Utc));

            modelBuilder.Entity<FacturaVenta>()
                .HasOne(f => f.Pedido)
                .WithMany()
                .HasForeignKey(f => f.PedidoId)
                .OnDelete(DeleteBehavior.SetNull);

            // Número de factura único por restaurante: garantiza que dos cierres
            // concurrentes nunca emitan la misma factura (la secuencia se reserva de
            // forma atómica en SQLite y este índice actúa de guardia final).
            modelBuilder.Entity<FacturaVenta>()
                .HasIndex(f => new { f.RestauranteId, f.NumeroFactura })
                .IsUnique();

            // Una sola cuenta abierta por mesa en todo momento.
            modelBuilder.Entity<CuentaMesa>()
                .HasIndex(c => c.MesaId)
                .IsUnique()
                .HasFilter("[Estado] = 0");

            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.FacturaVenta)
                .WithMany()
                .HasForeignKey(p => p.FacturaVentaId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<CuentaMesa>()
                .HasOne(c => c.Mesa)
                .WithMany()
                .HasForeignKey(c => c.MesaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CuentaMesa>()
                .HasOne(c => c.FacturaVenta)
                .WithMany()
                .HasForeignKey(c => c.FacturaVentaId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.CuentaMesa)
                .WithMany(c => c.Pedidos)
                .HasForeignKey(p => p.CuentaMesaId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PlanRestaurante>()
                .Property(p => p.FechaInicio)
                .HasConversion(
                    v => v.ToString("O"),
                    v => DateTime.SpecifyKind(
                        DateTime.Parse(v, null, DateTimeStyles.RoundtripKind),
                        DateTimeKind.Utc));

            modelBuilder.Entity<PlanRestaurante>()
                .Property(p => p.FechaFin)
                .HasConversion(
                    v => v.ToString("O"),
                    v => DateTime.SpecifyKind(
                        DateTime.Parse(v, null, DateTimeStyles.RoundtripKind),
                        DateTimeKind.Utc));

            modelBuilder.Entity<PlanRestaurante>()
                .Property(p => p.FechaPago)
                .HasConversion(
                    v => v.ToString("O"),
                    v => DateTime.SpecifyKind(
                        DateTime.Parse(v, null, DateTimeStyles.RoundtripKind),
                        DateTimeKind.Utc));

            // Un permiso no se puede asignar dos veces al mismo rol.
            modelBuilder.Entity<RolPermiso>()
                .HasIndex(rp => new { rp.Rol, rp.PermisoClave })
                .IsUnique();

            modelBuilder.Entity<Permiso>()
                .HasIndex(p => p.Clave)
                .IsUnique();

            // Un solo % de reparto por rol dentro de un restaurante.
            modelBuilder.Entity<RepartoPropinaRol>()
                .HasIndex(r => new { r.RestauranteId, r.Rol })
                .IsUnique();

            modelBuilder.Entity<PagoPropina>()
                .HasMany(p => p.Detalles)
                .WithOne(d => d.PagoPropina)
                .HasForeignKey(d => d.PagoPropinaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FacturaVenta>()
                .HasOne(f => f.PagoPropina)
                .WithMany()
                .HasForeignKey(f => f.PagoPropinaId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
