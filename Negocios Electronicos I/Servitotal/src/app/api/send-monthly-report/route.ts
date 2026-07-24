import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("❌ [API send-monthly-report] Falta la variable RESEND_API_KEY en Hostinger.");
      return NextResponse.json(
        { error: "Error de configuración: Falta RESEND_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email, restaurantName, monthName, totalSales, totalOrders, totalTips, topDishes } = body;

    if (!email) {
      return NextResponse.json({ error: "El correo destinatario es obligatorio." }, { status: 400 });
    }

    const resend = new Resend(apiKey);

    console.log(`📩 [API send-monthly-report] Intentando enviar correo a: ${email}`);

    // 🟢 Ejecución de envío con respuesta destructurada { data, error }
    const { data, error } = await resend.emails.send({
      from: "Servitotal <soporte@servitotal.expando.mx>",
      to: [email],
      subject: `📊 Resumen Financiero Mensual (${monthName}) - ${restaurantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
            <h1 style="color: #e85d04; margin: 0; font-size: 24px;">Servitotal</h1>
            <p style="color: #6b7280; margin-top: 4px; font-size: 14px;">Reporte Ejecutivo de Balance Mensual</p>
          </div>

          <div style="padding: 20px 0;">
            <h2 style="color: #111827; font-size: 18px; margin-bottom: 5px;">Hola, administrador de ${restaurantName || "tu negocio"}</h2>
            <p style="color: #4b5563; font-size: 14px; margin-top: 0;">Aquí tienes el desglose de rendimiento correspondiente al mes de <strong>${monthName || "este mes"}</strong>.</p>

            <!-- Grid de Métricas Principales -->
            <table width="100%" cellSpacing="0" cellPadding="0" style="margin: 20px 0;">
              <tr>
                <td style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; width: 30%; text-align: center;">
                  <span style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Ventas Totales</span>
                  <div style="font-size: 18px; font-weight: bold; color: #10b981; margin-top: 5px;">$${(totalSales || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div>
                </td>
                <td width="5%"></td>
                <td style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; width: 30%; text-align: center;">
                  <span style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Comandas</span>
                  <div style="font-size: 18px; font-weight: bold; color: #1f2937; margin-top: 5px;">${totalOrders || 0}</div>
                </td>
                <td width="5%"></td>
                <td style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; width: 30%; text-align: center;">
                  <span style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Propinas</span>
                  <div style="font-size: 18px; font-weight: bold; color: #f59e0b; margin-top: 5px;">$${(totalTips || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div>
                </td>
              </tr>
            </table>

            <!-- Platos más vendidos si existen -->
            ${
              Array.isArray(topDishes) && topDishes.length > 0
                ? `
              <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 15px;">
                <h3 style="font-size: 14px; color: #374151; margin-top: 0; margin-bottom: 10px;">🔥 Top Platillos más Vendidos</h3>
                <ul style="padding-left: 20px; margin: 0; color: #4b5563; font-size: 14px;">
                  ${topDishes.map((d: any) => `<li style="margin-bottom: 5px;"><strong>${d.name || d.nombre}</strong> - ${d.qty || d.cantidad || 0} unidades</li>`).join("")}
                </ul>
              </div>
            `
                : ""
            }

            <div style="margin-top: 25px; padding: 15px; background-color: #eff6ff; border-radius: 8px; font-size: 13px; color: #1e40af;">
              💡 <strong>Tip de Operación:</strong> Recuerda que puedes ver el reporte en tiempo real desde tu panel de administración.
            </div>
          </div>

          <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 12px; color: #9ca3af;">
            Servitotal POS • Puebla, México <br/>
            Este reporte fue solicitado desde tu panel de configuración.
          </div>
        </div>
      `,
    });

    // 🟢 Si Resend devolvió un error de envío (ej. dominio no verificado), captúralo aquí:
    if (error) {
      console.error("❌ [API send-monthly-report] Error retornado por Resend:", error);
      return NextResponse.json(
        { error: error.message || "Resend rechazó el envío del correo." },
        { status: 400 }
      );
    }

    console.log("✅ [API send-monthly-report] Correo enviado exitosamente:", data);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ [API send-monthly-report] Excepción interna:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno al enviar el reporte mensual." },
      { status: 500 }
    );
  }
}