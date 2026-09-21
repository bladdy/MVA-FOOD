using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CuentaMesa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CuentaMesaId",
                table: "Pedidos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CuentasMesas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MesaId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    FechaApertura = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FechaCierre = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ClienteNombre = table.Column<string>(type: "TEXT", nullable: true),
                    ClienteTelefono = table.Column<string>(type: "TEXT", nullable: true),
                    MetodoPago = table.Column<string>(type: "TEXT", nullable: true),
                    TipoEntrega = table.Column<string>(type: "TEXT", nullable: true),
                    Subtotal = table.Column<decimal>(type: "TEXT", nullable: false),
                    Impuesto = table.Column<decimal>(type: "TEXT", nullable: false),
                    Total = table.Column<decimal>(type: "TEXT", nullable: false),
                    FacturaVentaId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CuentasMesas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CuentasMesas_FacturasVentas_FacturaVentaId",
                        column: x => x.FacturaVentaId,
                        principalTable: "FacturasVentas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CuentasMesas_Mesas_MesaId",
                        column: x => x.MesaId,
                        principalTable: "Mesas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CuentasMesas_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_CuentaMesaId",
                table: "Pedidos",
                column: "CuentaMesaId");

            migrationBuilder.CreateIndex(
                name: "IX_CuentasMesas_FacturaVentaId",
                table: "CuentasMesas",
                column: "FacturaVentaId");

            migrationBuilder.CreateIndex(
                name: "IX_CuentasMesas_MesaId",
                table: "CuentasMesas",
                column: "MesaId");

            migrationBuilder.CreateIndex(
                name: "IX_CuentasMesas_RestauranteId",
                table: "CuentasMesas",
                column: "RestauranteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_CuentasMesas_CuentaMesaId",
                table: "Pedidos",
                column: "CuentaMesaId",
                principalTable: "CuentasMesas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_CuentasMesas_CuentaMesaId",
                table: "Pedidos");

            migrationBuilder.DropTable(
                name: "CuentasMesas");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_CuentaMesaId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "CuentaMesaId",
                table: "Pedidos");
        }
    }
}
