import * as ftp from 'basic-ftp';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
export { renderers } from '../../renderers.mjs';

const FTP_CONFIG = {
  host: "localhost",
  // o "ftp-storage" si estás en contenedor
  port: 21,
  user: "usuario",
  password: "clave123",
  secure: false
};
async function uploadToFtp(localPath, subfolder, originalName) {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access(FTP_CONFIG);
    await client.ensureDir(subfolder);
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const newName = `${timestamp}${ext}`;
    await client.uploadFrom(localPath, newName);
    console.log(`✅ Subido como ${subfolder}/${newName}`);
    return `${subfolder}/${newName}`;
  } catch (err) {
    console.error("❌ Error al subir al FTP:", err);
    throw err;
  } finally {
    client.close();
  }
}

const POST = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file");
  const tipo = "logo";
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
