using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCombos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_Menus_MenuId",
                table: "PedidoItems");

            migrationBuilder.AlterColumn<Guid>(
                name: "MenuId",
                table: "PedidoItems",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "TEXT");

            migrationBuilder.AddColumn<Guid>(
                name: "ComboId",
                table: "PedidoItems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComboItemsJson",
                table: "PedidoItems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComboNombre",
                table: "PedidoItems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EsCombo",
                table: "PedidoItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Combos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Nombre = table.Column<string>(type: "TEXT", nullable: true),
                    Descripcion = table.Column<string>(type: "TEXT", nullable: true),
                    Precio = table.Column<decimal>(type: "TEXT", nullable: true),
                    Imagen = table.Column<string>(type: "TEXT", nullable: true),
                    Activo = table.Column<bool>(type: "INTEGER", nullable: false),
                    Predefinido = table.Column<bool>(type: "INTEGER", nullable: false),
                    RestauranteId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Combos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Combos_Restaurantes_RestauranteId",
                        column: x => x.RestauranteId,
                        principalTable: "Restaurantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ComboMenus",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ComboId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MenuId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Cantidad = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComboMenus", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComboMenus_Combos_ComboId",
                        column: x => x.ComboId,
                        principalTable: "Combos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComboMenus_Menus_MenuId",
                        column: x => x.MenuId,
                        principalTable: "Menus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MenuComboSugeridos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    MenuId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ComboId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PrecioAdicional = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuComboSugeridos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MenuComboSugeridos_Combos_ComboId",
                        column: x => x.ComboId,
                        principalTable: "Combos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MenuComboSugeridos_Menus_MenuId",
                        column: x => x.MenuId,
                        principalTable: "Menus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComboMenus_ComboId",
                table: "ComboMenus",
                column: "ComboId");

            migrationBuilder.CreateIndex(
                name: "IX_ComboMenus_MenuId",
                table: "ComboMenus",
                column: "MenuId");

            migrationBuilder.CreateIndex(
                name: "IX_Combos_RestauranteId",
                table: "Combos",
                column: "RestauranteId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuComboSugeridos_ComboId",
                table: "MenuComboSugeridos",
                column: "ComboId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuComboSugeridos_MenuId",
                table: "MenuComboSugeridos",
                column: "MenuId");

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_Menus_MenuId",
                table: "PedidoItems",
                column: "MenuId",
                principalTable: "Menus",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_Menus_MenuId",
                table: "PedidoItems");

            migrationBuilder.DropTable(
                name: "ComboMenus");

            migrationBuilder.DropTable(
                name: "MenuComboSugeridos");

            migrationBuilder.DropTable(
                name: "Combos");

            migrationBuilder.DropColumn(
                name: "ComboId",
                table: "PedidoItems");

            migrationBuilder.DropColumn(
                name: "ComboItemsJson",
                table: "PedidoItems");

            migrationBuilder.DropColumn(
                name: "ComboNombre",
                table: "PedidoItems");

            migrationBuilder.DropColumn(
                name: "EsCombo",
                table: "PedidoItems");

            migrationBuilder.AlterColumn<Guid>(
                name: "MenuId",
                table: "PedidoItems",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_Menus_MenuId",
                table: "PedidoItems",
                column: "MenuId",
                principalTable: "Menus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
