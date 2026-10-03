using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPagoFacturaVenta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Cambio",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaPago",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MontoRecibido",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UsuarioCajaId",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioCajaNombre",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cambio",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "FechaPago",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "MontoRecibido",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "UsuarioCajaId",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "UsuarioCajaNombre",
                table: "FacturasVentas");
        }
    }
}
