using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMesaToPedido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MesaId",
                table: "Pedidos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumeroMesa",
                table: "Pedidos",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_MesaId",
                table: "Pedidos",
                column: "MesaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Mesas_MesaId",
                table: "Pedidos",
                column: "MesaId",
                principalTable: "Mesas",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Mesas_MesaId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_MesaId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "MesaId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "NumeroMesa",
                table: "Pedidos");
        }
    }
}
