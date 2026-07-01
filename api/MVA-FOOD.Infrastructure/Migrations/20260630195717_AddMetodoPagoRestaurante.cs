using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMetodoPagoRestaurante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MetodoPago",
                table: "Pedidos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MetodosPagoRestaurante",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: true),
                    Icono = table.Column<string>(type: "TEXT", nullable: true),
                    Activo = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetodosPagoRestaurante", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MetodosPagoRestaurante_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MetodosPagoRestaurante_RestauranteId",
                table: "MetodosPagoRestaurante",
                column: "RestauranteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MetodosPagoRestaurante");

            migrationBuilder.DropColumn(
                name: "MetodoPago",
                table: "Pedidos");
        }
    }
}
