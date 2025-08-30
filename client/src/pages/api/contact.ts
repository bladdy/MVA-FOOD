// src/pages/api/contact.ts (o .js)
/*export const prerender = false;
// Asegúrate de que este archivo no se prerenderice
import nodemailer from "nodemailer";

export async function POST({ request }: { request: Request }) {
  const data = await request.formData();
  const name = data.get("from_name");
  const lastname = data.get("from_last_name");
  const phone = data.get("reply_phone");
  const email = data.get("reply_to");
  const message = data.get("message");

  // Configura tu transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "escalate.soft.soluctions@gmail.com",
      pass: "mwhk ddai swsx uvfe",
    },
  });

    const mailOptions = {
    from: `"${name} ${lastname}" <${email}>`,
    to: "bladdy34@gmail.com",
    subject: "Mensaje desde el formulario de contacto de MVA Foods",
    text: `Nombre: ${name} ${lastname}\nEmail: ${phone} \nEmail: ${email}\nMensaje: ${message}`,
    html: `
        <div style="
        max-width: 600px;
        margin: auto;
        padding: 20px;
        font-family: Arial, sans-serif;
        background-color: rgb(61, 102, 177);
        color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        ">
        <h2 style="
            margin-top: 0;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ffffff20;
            color: rgb(255, 255, 255);
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 20px;
        ">
            📬 Nuevo mensaje desde el formulario de contacto
        </h2>
        <p style="font-size: 16px; margin-bottom: 12px;">
            <strong>Nombre:</strong> ${name} ${lastname}
        </p>
        <p style="font-size: 16px; margin-bottom: 12px;">
            <strong>Telefono:</strong> ${phone}
        </p>
        <p style="font-size: 16px; margin-bottom: 12px; text-decoration: none;">
            <strong>Email:</strong> ${email}
        </p>
        <p style="font-size: 16px; margin-bottom: 12px;">
            <strong>Mensaje:</strong><br>
            ${typeof message === "string" ? message.replace(/\n/g, "<br>") : ""}
        </p>
        </div>
    `,
    };


  try {
    await transporter.sendMail(mailOptions);
    return new Response(
      JSON.stringify({ success: true, message: "Correo enviado correctamente." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error al enviar el correo." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}*/
