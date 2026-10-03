using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RedisenoFlujoPedidosFacturacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FacturasVentas_RestauranteId",
                table: "FacturasVentas");

            migrationBuilder.DropIndex(
                name: "IX_CuentasMesas_MesaId",
                table: "CuentasMesas");

            migrationBuilder.AddColumn<string>(
                name: "Notas",
                table: "FacturaVentaItems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProductoId",
                table: "FacturaVentaItems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FacturasVentas_RestauranteId_NumeroFactura",
                table: "FacturasVentas",
                columns: new[] { "RestauranteId", "NumeroFactura" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CuentasMesas_MesaId",
                table: "CuentasMesas",
                column: "MesaId",
                unique: true,
                filter: "[Estado] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FacturasVentas_RestauranteId_NumeroFactura",
                table: "FacturasVentas");

            migrationBuilder.DropIndex(
                name: "IX_CuentasMesas_MesaId",
                table: "CuentasMesas");

            migrationBuilder.DropColumn(
                name: "Notas",
                table: "FacturaVentaItems");

            migrationBuilder.DropColumn(
                name: "ProductoId",
                table: "FacturaVentaItems");

            migrationBuilder.CreateIndex(
                name: "IX_FacturasVentas_RestauranteId",
                table: "FacturasVentas",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_CuentasMesas_MesaId",
                table: "CuentasMesas",
                column: "MesaId");
        }
    }
}
