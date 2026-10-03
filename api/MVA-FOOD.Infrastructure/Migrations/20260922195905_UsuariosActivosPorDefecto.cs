using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MVA_FOOD.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UsuariosActivosPorDefecto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Los usuarios existentes antes de la columna Activo no pueden quedar
            // bloqueados por defecto: se les activa. Cuando se desactive alguno de
            // forma intencional, la edición persistirá (esta migración corre una vez).
            migrationBuilder.Sql("UPDATE Usuarios SET Activo = 1 WHERE Activo = 0;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
