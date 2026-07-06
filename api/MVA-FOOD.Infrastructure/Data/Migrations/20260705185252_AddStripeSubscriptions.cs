using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "Restaurantes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSubscriptionId",
                table: "PlanesRestaurantes",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "StripeSubscriptionId",
                table: "PlanesRestaurantes");
        }
    }
}
