using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MvaFood.Api.Models;

namespace MvaFood.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Restaurante> Restaurantes => Set<Restaurante>();
        public DbSet<Menu> Menus => Set<Menu>();
        public DbSet<Amenidad> Amenidades => Set<Amenidad>();
        public DbSet<Horario> Horarios => Set<Horario>();
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

        }
    }
}