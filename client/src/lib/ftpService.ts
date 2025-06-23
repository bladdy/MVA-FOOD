import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";

const FTP_CONFIG = {
  host: "localhost", // o "ftp-storage" si estás en contenedor
  port: 21,
  user: "usuario",
  password: "clave123",
  secure: false,
};

export async function uploadToFtp(localPath: string, subfolder: string, originalName: string): Promise<string> {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access(FTP_CONFIG);

    // 👇 Crea la carpeta si no existe y entra en ella
    await client.ensureDir(subfolder);

    // 👇 Genera nuevo nombre con timestamp y misma extensión
    const timestamp = Date.now();
    const ext = path.extname(originalName); // ej: .png
    const newName = `${timestamp}${ext}`;

    // 👇 Sube el archivo
    await client.uploadFrom(localPath, newName);

    console.log(`✅ Subido como ${subfolder}/${newName}`);
    return `${subfolder}/${newName}`; // ruta relativa para armar la URL
  } catch (err) {
    console.error("❌ Error al subir al FTP:", err);
    throw err;
  } finally {
    client.close();
  }
}
