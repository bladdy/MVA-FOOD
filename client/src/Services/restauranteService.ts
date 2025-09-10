import type { Restaurante, RestauranteUpdateDto } from "@/Types/Restaurante.ts";
const API_URL = "http://localhost:5147/api";

export async function getRestaurante(id: string) {
  const res = await fetch(`${API_URL}/restaurantes/${id}`);
  if (!res.ok) throw new Error("Error al obtener restaurante");
  return await res.json();
}

export async function updateRestaurante(id: string, data: Restaurante) {
  const formData = new FormData();
  console.log(data,id)
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
  if (data.amnidades) {
    data.amnidades.forEach((id) => {
      formData.append("AmenidadIds", id);
    });
  }

  // ✅ Categorías
  if (data.categorias) {
    data.categorias.forEach((id) => {
      formData.append("CategoriaIds", id);
    });
  }

  // ✅ Horarios (como JSON, porque son objetos)

  //ToDo: Revisar porque no guarda el horario
  if (data.horarios) {
    console.log(data.horarios)
    formData.append("Horarios", JSON.stringify(data.horarios));
  }

  const res = await fetch(`${API_URL}/restaurantes/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) throw new Error("Error al actualizar restaurante");
  return await res.json();
}

