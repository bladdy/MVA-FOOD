

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
    }
}


/*

{
  "nombre": "El Crustaceo Casckarudo 2",
  "direccion": "string",
  "telefono": "string",
  "image": "string",
  "perfilImage": "string",
  "planId": "C3835614-2FCD-4895-9891-5658FA203BDF",
  "fechaInicio": "2025-08-23T22:33:28.454Z",
  "usuarioId": "42D6EBD6-4A58-486F-8BC9-47DFB39C6F27"
}

*/