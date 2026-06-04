using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialDB3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MenuId",
                table: "Variantes",
                newName: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Variantes_CategoriaId",
                table: "Variantes",
                column: "CategoriaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Variantes_Categorias_CategoriaId",
                table: "Variantes",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Variantes_Categorias_CategoriaId",
                table: "Variantes");

            migrationBuilder.DropIndex(
                name: "IX_Variantes_CategoriaId",
                table: "Variantes");

            migrationBuilder.RenameColumn(
                name: "CategoriaId",
                table: "Variantes",
                newName: "MenuId");
        }
    }
}
