using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MeseroPropinaEnPedidoYFactura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PorcentajePropina",
                table: "Restaurantes",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "MeseroNombre",
                table: "Pedidos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "MeseroUsuarioId",
                table: "Pedidos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MeseroNombre",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "MeseroUsuarioId",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PorcentajePropina",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Propina",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalConPropina",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PorcentajePropina",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "MeseroNombre",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "MeseroUsuarioId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "MeseroNombre",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "MeseroUsuarioId",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "PorcentajePropina",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "Propina",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "TotalConPropina",
                table: "FacturasVentas");
        }
    }
}
