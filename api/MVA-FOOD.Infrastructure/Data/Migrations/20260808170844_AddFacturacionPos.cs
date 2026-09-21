using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFacturacionPos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ImpuestoIncluido",
                table: "Restaurantes",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MensajePieFactura",
                table: "Restaurantes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroFiscal",
                table: "Restaurantes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PorcentajeImpuesto",
                table: "Restaurantes",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PrefijoFactura",
                table: "Restaurantes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SecuenciaFactura",
                table: "Restaurantes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "FacturasVentas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PedidoId = table.Column<Guid>(type: "TEXT", nullable: true),
                    NumeroFactura = table.Column<string>(type: "TEXT", nullable: true),
                    FechaEmision = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ClienteNombre = table.Column<string>(type: "TEXT", nullable: true),
                    ClienteTelefono = table.Column<string>(type: "TEXT", nullable: true),
                    ClienteNumeroFiscal = table.Column<string>(type: "TEXT", nullable: true),
                    TipoEntrega = table.Column<string>(type: "TEXT", nullable: true),
                    MetodoPago = table.Column<string>(type: "TEXT", nullable: true),
                    Subtotal = table.Column<decimal>(type: "TEXT", nullable: false),
                    Impuesto = table.Column<decimal>(type: "TEXT", nullable: false),
                    Total = table.Column<decimal>(type: "TEXT", nullable: false),
                    PorcentajeImpuesto = table.Column<decimal>(type: "TEXT", nullable: false),
                    ImpuestoIncluido = table.Column<bool>(type: "INTEGER", nullable: false),
                    Estado = table.Column<int>(type: "INTEGER", nullable: false),
                    Nota = table.Column<string>(type: "TEXT", nullable: true),
                    Moneda = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FacturasVentas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FacturasVentas_Pedidos_PedidoId",
                        column: x => x.PedidoId,
                        principalTable: "Pedidos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FacturasVentas_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FacturaVentaItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    FacturaVentaId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: true),
                    Precio = table.Column<decimal>(type: "TEXT", nullable: false),
                    Cantidad = table.Column<int>(type: "INTEGER", nullable: false),
                    Opciones = table.Column<string>(type: "TEXT", nullable: true),
                    EsCombo = table.Column<bool>(type: "INTEGER", nullable: false),
                    ComboNombre = table.Column<string>(type: "TEXT", nullable: true),
                    ComboItemsJson = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FacturaVentaItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FacturaVentaItems_FacturasVentas_FacturaVentaId",
                        column: x => x.FacturaVentaId,
                        principalTable: "FacturasVentas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FacturasVentas_PedidoId",
                table: "FacturasVentas",
                column: "PedidoId");

            migrationBuilder.CreateIndex(
                name: "IX_FacturasVentas_RestauranteId",
                table: "FacturasVentas",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_FacturaVentaItems_FacturaVentaId",
                table: "FacturaVentaItems",
                column: "FacturaVentaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FacturaVentaItems");

            migrationBuilder.DropTable(
                name: "FacturasVentas");

            migrationBuilder.DropColumn(
                name: "ImpuestoIncluido",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "MensajePieFactura",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "NumeroFiscal",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "PorcentajeImpuesto",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "PrefijoFactura",
                table: "Restaurantes");

            migrationBuilder.DropColumn(
                name: "SecuenciaFactura",
                table: "Restaurantes");
        }
    }
}
