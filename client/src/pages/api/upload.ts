import type { APIRoute } from "astro";
import { uploadToFtp } from "@/lib/ftpService";
import path from "path";
import fs from "fs/promises";
import os from "os";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const tipo ="logo" //formData.get("tipo"); // ej: 'perfil' o 'logo'

  if (!file || file.size === 0 || !tipo) {
    return new Response("Archivo o tipo no válido", { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const tempPath = path.join(os.tmpdir(), file.name);
  await fs.writeFile(tempPath, buffer);

  try {
    const rutaRelativa = await uploadToFtp(tempPath, `restaurante/${tipo}`, file.name);

    return new Response(
      JSON.stringify({ url: `http://localhost:8080/${rutaRelativa}` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response("Error al subir al servidor FTP", { status: 500 });
  } finally {
    await fs.unlink(tempPath);
  }
};
