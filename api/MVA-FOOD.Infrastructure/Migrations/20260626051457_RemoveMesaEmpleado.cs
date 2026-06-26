using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMesaEmpleado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Empleados_EmpleadoId",
                table: "Pedidos");

            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Mesas_MesaId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_EmpleadoId",
                table: "Pedidos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_MesaId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "EmpleadoId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "MesaId",
                table: "Pedidos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EmpleadoId",
                table: "Pedidos",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "MesaId",
                table: "Pedidos",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_EmpleadoId",
                table: "Pedidos",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_MesaId",
                table: "Pedidos",
                column: "MesaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Empleados_EmpleadoId",
                table: "Pedidos",
                column: "EmpleadoId",
                principalTable: "Empleados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Mesas_MesaId",
                table: "Pedidos",
                column: "MesaId",
                principalTable: "Mesas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
