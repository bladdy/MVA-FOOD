

using Microsoft.AspNetCore.Http;

namespace MVA_FOOD.Infrastructure.Helpers
{
    public class ImagenesHelpers
    {
        public static async Task<string> GuardarImagenAsync(IFormFile file, string carpeta)
        {
            // Ruta base (relativa a la carpeta del proyecto)
            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var rutaCarpeta = Path.Combine(webRootPath, "uploads", carpeta);

            // Asegurar que la carpeta exista
            Directory.CreateDirectory(rutaCarpeta);

            // Generar nombre único
            var nombreArchivo = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var rutaArchivo = Path.Combine(rutaCarpeta, nombreArchivo);

            // Guardar el archivo
            using (var stream = new FileStream(rutaArchivo, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Retornar la ruta pública (para usar en el frontend)
            return $"/uploads/{carpeta}/{nombreArchivo}";
        }

        public static async Task<string> ActualizarImagenAsync(IFormFile file, string carpeta, string imagenActual = null)
        {
            if (file == null) return imagenActual; // Si no hay nueva imagen, retornamos la actual

            // Ruta base
            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var rutaCarpeta = Path.Combine(webRootPath, "uploads", carpeta);
            Directory.CreateDirectory(rutaCarpeta);

            // Generar nombre único
            var nombreArchivo = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var rutaArchivo = Path.Combine(rutaCarpeta, nombreArchivo);

            // Guardar el archivo
            using (var stream = new FileStream(rutaArchivo, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Opcional: eliminar imagen anterior si existía
            if (!string.IsNullOrEmpty(imagenActual))
            {
                var rutaAnterior = Path.Combine(webRootPath, imagenActual.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
                if (File.Exists(rutaAnterior))
                    File.Delete(rutaAnterior);
            }

            // Retornar la nueva ruta pública
            return $"/uploads/{carpeta}/{nombreArchivo}";
        }
        public static Task<bool> EliminarImagenAsync(string rutaImagen)
        {
            if (string.IsNullOrEmpty(rutaImagen)) 
                return Task.FromResult(false);

            // Ruta física en disco
            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var rutaCompleta = Path.Combine(webRootPath, rutaImagen.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (File.Exists(rutaCompleta))
            {
                File.Delete(rutaCompleta);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
    }
}
