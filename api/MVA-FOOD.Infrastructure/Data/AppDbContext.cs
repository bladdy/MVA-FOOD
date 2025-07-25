using System;
using System.Collections.Generic;
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
        public DbSet<Horario> Horarios { get; set; }
        public DbSet<Empleado> Empleados { get; set; }
        public DbSet<Plan> Planes { get; set; }
        public DbSet<PlanRestaurante> PlanesRestaurantes { get; set; }
        public DbSet<Variante> Variantes { get; set; }
        public DbSet<VarianteOpcion> VarianteOpciones { get; set; } 
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<PedidoItem> PedidoItems { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Restaurante>()
                .HasMany(r => r.Amenidades)
                .WithMany(a => a.Restaurantes);

            modelBuilder.Entity<Restaurante>()
                .HasOne(r => r.PlanRestaurante)
                .WithOne(pr => pr.Restaurante)
                .HasForeignKey<PlanRestaurante>(pr => pr.RestauranteId)
                .OnDelete(DeleteBehavior.Cascade);
        }   

    }
}