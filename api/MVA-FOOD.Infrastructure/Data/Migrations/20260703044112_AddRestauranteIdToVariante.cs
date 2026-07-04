using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Data.Migrations
{
    public partial class AddRestauranteIdToVariante : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Agregar columna nullable primero para poblar datos existentes
            migrationBuilder.AddColumn<Guid>(
                name: "RestauranteId",
                table: "Variantes",
                type: "TEXT",
                nullable: true);

            // 2. Poblar RestauranteId desde los menús asociados vía VarianteMenus
            migrationBuilder.Sql(@"
                UPDATE Variantes
                SET RestauranteId = (
                    SELECT m.RestauranteId
                    FROM VarianteMenus vm
                    INNER JOIN Menus m ON m.Id = vm.MenuId
                    WHERE vm.VarianteId = Variantes.Id
                    LIMIT 1
                )
                WHERE EXISTS (
                    SELECT 1 FROM VarianteMenus vm WHERE vm.VarianteId = Variantes.Id
                );
            ");

            // 3. Eliminar variantes huerfanas (sin menú asociado) que quedaron sin RestauranteId
            migrationBuilder.Sql(@"
                DELETE FROM Variantes WHERE RestauranteId IS NULL;
            ");

            // 4. Crear índice y FK
            migrationBuilder.CreateIndex(
                name: "IX_Variantes_RestauranteId",
                table: "Variantes",
                column: "RestauranteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Variantes_Restaurantes_RestauranteId",
                table: "Variantes",
                column: "RestauranteId",
                principalTable: "Restaurantes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Variantes_Restaurantes_RestauranteId",
                table: "Variantes");

            migrationBuilder.DropIndex(
                name: "IX_Variantes_RestauranteId",
                table: "Variantes");

            migrationBuilder.DropColumn(
                name: "RestauranteId",
                table: "Variantes");
        }
    }
}
