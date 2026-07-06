using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFacturacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Estado",
                table: "PlanesRestaurantes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripePriceId",
                table: "Planes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Facturas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PlanRestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    NumeroFactura = table.Column<string>(type: "TEXT", nullable: true),
                    Monto = table.Column<decimal>(type: "TEXT", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaPago = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Pagado = table.Column<bool>(type: "INTEGER", nullable: false),
                    Concepto = table.Column<string>(type: "TEXT", nullable: true),
                    StripePaymentIntentId = table.Column<string>(type: "TEXT", nullable: true),
                    StripeInvoiceId = table.Column<string>(type: "TEXT", nullable: true),
                    PdfPath = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facturas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Facturas_PlanesRestaurantes_PlanRestauranteId",
                        column: x => x.PlanRestauranteId,
                        principalTable: "PlanesRestaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Facturas_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_PlanRestauranteId",
                table: "Facturas",
                column: "PlanRestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_RestauranteId",
                table: "Facturas",
                column: "RestauranteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Facturas");

            migrationBuilder.DropColumn(
                name: "Estado",
                table: "PlanesRestaurantes");

            migrationBuilder.DropColumn(
                name: "StripePriceId",
                table: "Planes");
        }
    }
}
