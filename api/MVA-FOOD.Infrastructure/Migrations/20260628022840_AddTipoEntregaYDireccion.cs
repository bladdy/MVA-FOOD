using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoEntregaYDireccion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Direccion",
                table: "Pedidos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TipoEntrega",
                table: "Pedidos",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Direccion",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "TipoEntrega",
                table: "Pedidos");
        }
    }
}
