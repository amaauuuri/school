import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY || "re_XHGJZb8t_LgrLhN7r1RKCicKrsDD2muVb";

    const { email, name, planName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "El correo es obligatorio" }, { status: 400 });
    }

    const resend = new Resend(apiKey);

    const data = await resend.emails.send({
// 🟢 AHORA (Tu dominio real verificado):
    from: "Servitotal <soporte@servitotal.expando.mx>",
      to: [email],
      subject: "¡Bienvenido a Servitotal! Confirmación de Suscripción 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #e85d04;">¡Hola, ${name || "Administrador"}!</h1>
          <p>Gracias por suscribirte a <strong>Servitotal</strong>.</p>
          <p>Tu plan <strong>${planName || "PRO"}</strong> ya se encuentra totalmente activo.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p>Ya puedes acceder a tu consola de administración para configurar el menú de tu restaurante y dar de alta a tu equipo de meseros.</p>
          <a href="https://servitotal.expando.mx/login" style="background-color: #e85d04; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ir a mi cuenta</a>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error en API send-welcome:", err);
    return NextResponse.json(
      { error: err?.message || "Error al enviar el correo" },
      { status: 500 }
    );
  }
}