import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializamos Stripe con la API Key de Sandbox
const stripe = new Stripe(
  "sk_test_51TwHTBGpvZwHeCQQCR6VbyGMJVymYWx6lYXZZmI0d6ysHNMxbCvzegRH9RFr9eKIy7oGN2f2HAkD0WzI7oMBEmFv00vGquvDPN",
  {
    apiVersion: "2022-11-15" as any,
  }
);

// Definimos precios exactos por plan
const PLAN_PRICES: Record<string, { name: string; amount: number }> = {
  starter: { name: "Servitotal Starter", amount: 49900 },      // $499.00 MXN
  pro: { name: "Servitotal Pro", amount: 89900 },              // $899.00 MXN
  enterprise: { name: "Servitotal Enterprise", amount: 149900 }, // $1,499.00 MXN
};

export async function POST(req: Request) {
  try {
    const { planId, userId, userEmail } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos (planId, userId)" },
        { status: 400 }
      );
    }

    // 🟢 1. Normalización inteligente del planId enviado desde el frontend
    const rawId = String(planId).toLowerCase().trim();
    let selectedKey = "starter";

    if (rawId.includes("enterprise")) {
      selectedKey = "enterprise";
    } else if (rawId.includes("pro")) {
      selectedKey = "pro";
    } else if (rawId.includes("starter")) {
      selectedKey = "starter";
    }

    const plan = PLAN_PRICES[selectedKey];
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // 🟢 2. Crear la sesión de suscripción en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: plan.name,
              description: `Suscripción mensual al plan ${selectedKey.toUpperCase()} de Servitotal`,
            },
            unit_amount: plan.amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      // Redirección de éxito directa al panel de administración
      success_url: `${origin}/admin/menu?session_id={CHECKOUT_SESSION_ID}&plan=${selectedKey}`,
      // Redirección de cancelación de regreso a la página de servicios
      cancel_url: `${origin}/servicio`,
      customer_email: userEmail || undefined,
      metadata: {
        userId,
        planId: selectedKey,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Session Error:", err);
    return NextResponse.json(
      { error: err.message || "Error al crear la sesión de pago en Stripe" },
      { status: 500 }
    );
  }
}