using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivoToPedido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "Pedidos",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.Sql(
                "UPDATE Pedidos SET Activo = 0 WHERE MesaId IS NOT NULL AND MesaId IN (SELECT Id FROM Mesas WHERE EstaOcupada = 0);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                table: "Pedidos");
        }
    }
}
