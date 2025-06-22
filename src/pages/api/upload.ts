// src/pages/api/upload.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { APIRoute } from 'astro';

const s3 = new S3Client({
  region: 'us-east-1', // Cualquiera (MinIO no valida región)
  endpoint: 'http://localhost:9000',
  forcePathStyle: true, // Necesario para MinIO
  credentials: {
    accessKeyId: 'admin',
    secretAccessKey: 'admin123',
  },
});

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), {
      status: 400,
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = `${Date.now()}_${file.name}`;

  try {
    const command = new PutObjectCommand({
      Bucket: 'uploads', // Asegúrate de que el bucket exista
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    return new Response(
      JSON.stringify({ message: 'Upload successful', fileName }),
      { status: 200 }
    );

    /*
     * Aquí puedes agregar lógica adicional después de la carga, como guardar la URL en una base de datos
    {
        "message": "Upload successful",
        "fileName": "1750554757468_work.png"
        "fileUrl": "http://localhost:9000/uploads/1750554757468_work.png"
     */
  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
    });
  }
};
