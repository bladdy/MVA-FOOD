using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PedidoFacturaVenta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FacturasVentas_Pedidos_PedidoId",
                table: "FacturasVentas");

            migrationBuilder.AddColumn<Guid>(
                name: "FacturaVentaId",
                table: "Pedidos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_FacturaVentaId",
                table: "Pedidos",
                column: "FacturaVentaId");

            migrationBuilder.AddForeignKey(
                name: "FK_FacturasVentas_Pedidos_PedidoId",
                table: "FacturasVentas",
                column: "PedidoId",
                principalTable: "Pedidos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_FacturasVentas_FacturaVentaId",
                table: "Pedidos",
                column: "FacturaVentaId",
                principalTable: "FacturasVentas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FacturasVentas_Pedidos_PedidoId",
                table: "FacturasVentas");

            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_FacturasVentas_FacturaVentaId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_FacturaVentaId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "FacturaVentaId",
                table: "Pedidos");

            migrationBuilder.AddForeignKey(
                name: "FK_FacturasVentas_Pedidos_PedidoId",
                table: "FacturasVentas",
                column: "PedidoId",
                principalTable: "Pedidos",
                principalColumn: "Id");
        }
    }
}
