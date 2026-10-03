using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PropinasRepartoPago : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ModoRepartoPropina",
                table: "Restaurantes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaLiquidacionPropina",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PagoPropinaId",
                table: "FacturasVentas",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PagosPropina",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Desde = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Hasta = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalDividir = table.Column<decimal>(type: "TEXT", nullable: false),
                    CantidadFacturas = table.Column<int>(type: "INTEGER", nullable: false),
                    Modo = table.Column<int>(type: "INTEGER", nullable: false),
                    Moneda = table.Column<string>(type: "TEXT", nullable: true),
                    UsuarioIdPago = table.Column<Guid>(type: "TEXT", nullable: false),
                    UsuarioPagoNombre = table.Column<string>(type: "TEXT", nullable: true),
                    FechaPago = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagosPropina", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PagosPropina_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RepartoPropinaRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Rol = table.Column<string>(type: "TEXT", nullable: true),
                    Porcentaje = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepartoPropinaRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepartoPropinaRoles_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PagosPropinaDetalles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PagoPropinaId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Nombre = table.Column<string>(type: "TEXT", nullable: true),
                    Rol = table.Column<string>(type: "TEXT", nullable: true),
                    Monto = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagosPropinaDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PagosPropinaDetalles_PagosPropina_PagoPropinaId",
                        column: x => x.PagoPropinaId,
                        principalTable: "PagosPropina",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FacturasVentas_PagoPropinaId",
                table: "FacturasVentas",
                column: "PagoPropinaId");

            migrationBuilder.CreateIndex(
                name: "IX_PagosPropina_RestauranteId",
                table: "PagosPropina",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_PagosPropinaDetalles_PagoPropinaId",
                table: "PagosPropinaDetalles",
                column: "PagoPropinaId");

            migrationBuilder.CreateIndex(
                name: "IX_RepartoPropinaRoles_RestauranteId_Rol",
                table: "RepartoPropinaRoles",
                columns: new[] { "RestauranteId", "Rol" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FacturasVentas_PagosPropina_PagoPropinaId",
                table: "FacturasVentas",
                column: "PagoPropinaId",
                principalTable: "PagosPropina",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FacturasVentas_PagosPropina_PagoPropinaId",
                table: "FacturasVentas");

            migrationBuilder.DropTable(
                name: "PagosPropinaDetalles");

            migrationBuilder.DropTable(
                name: "RepartoPropinaRoles");

            migrationBuilder.DropTable(
                name: "PagosPropina");

            migrationBuilder.DropIndex(
                name: "IX_FacturasVentas_PagoPropinaId",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "ModoRepartoPropina",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "FechaLiquidacionPropina",
                table: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "PagoPropinaId",
                table: "FacturasVentas");
        }
    }
}
