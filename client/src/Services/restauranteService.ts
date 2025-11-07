import type { Restaurante} from "@/Types/Restaurante.ts";
const API_URL = "http://localhost:5147/api";

export async function getRestaurante(id: string) {
  const res = await fetch(`${API_URL}/restaurantes/${id}`);
  if (!res.ok) throw new Error("Error al obtener restaurante");
  return await res.json();
}
// Obtener la lista de restaurantes con paginación
export async function getRestaurantes(pageNumber: number = 1, pageSize: number = 10) {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const res = await fetch(`${API_URL}/restaurantes?${params.toString()}`);
  if (!res.ok) throw new Error("Error al obtener restaurantes");
  return await res.json(); // Aquí puedes retornar los restaurantes paginados
}
export async function updateRestaurante(id: string, data: Restaurante) {
  const formData = new FormData();
  console.log(data, id);
  formData.append("Nombre", data.name);
  formData.append("Direccion", data.direccion);
  formData.append("Telefono", data.phone);

  if (data.perfilImage && data.perfilImage instanceof File) {
    formData.append("PerfilImage", data.perfilImage);
  }
  if (data.image && data.image instanceof File) {
    formData.append("Image", data.image);
  }

  // ✅ Amenidades
  if (data.amenities) {
    data.amenities.forEach((amenidad) => {
      formData.append("AmenidadIds", amenidad.id);
    });
  }

  // ✅ Categorías
  if (data.categorias) {
    data.categorias.forEach((id) => {
      formData.append("CategoriaIds", id);
    });
  }

  // ✅ Horarios (como JSON, porque son objetos)

  if (data.horarios && data.horarios.length > 0) {
  data.horarios.forEach((h, index) => {
    const horarioId = h.id || "00000000-0000-0000-0000-000000000000";
    formData.append(`Horarios[${index}].Id`, horarioId);
    formData.append(`Horarios[${index}].Dia`, mapDiaToEnum(h.dia).toString());
    formData.append(`Horarios[${index}].HoraApertura`, h.horaApertura + ":00");
    formData.append(`Horarios[${index}].HoraCierre`, h.horaCierre + ":00");
  });
}


  const res = await fetch(`${API_URL}/restaurantes/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) throw new Error("Error al actualizar restaurante");
  return await res.json();
}
function mapDiaToEnum(dia: string): number {
  switch (dia.toLowerCase()) {
    case "domingo":
      return 0;
    case "lunes":
      return 1;
    case "martes":
      return 2;
    case "miércoles":
      return 3;
    case "jueves":
      return 4;
    case "viernes":
      return 5;
    case "sábado":
      return 6;
    default:
      return 0;
  }
}
