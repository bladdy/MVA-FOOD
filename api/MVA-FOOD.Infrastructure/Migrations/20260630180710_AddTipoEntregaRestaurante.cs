using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoEntregaRestaurante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TiposEntregaRestaurante",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: true),
                    TiempoMinutos = table.Column<int>(type: "INTEGER", nullable: true),
                    CostoFijo = table.Column<decimal>(type: "TEXT", nullable: true),
                    Porcentaje = table.Column<decimal>(type: "TEXT", nullable: true),
                    Activo = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposEntregaRestaurante", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TiposEntregaRestaurante_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TiposEntregaRestaurante_RestauranteId",
                table: "TiposEntregaRestaurante",
                column: "RestauranteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TiposEntregaRestaurante");
        }
    }
}
