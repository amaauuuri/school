import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with the provided Sandbox Secret Key
const stripe = new Stripe("sk_test_51TwHTBGpvZwHeCQQCR6VbyGMJVymYWx6lYXZZmI0d6ysHNMxbCvzegRH9RFr9eKIy7oGN2f2HAkD0WzI7oMBEmFv00vGquvDPN", {
  apiVersion: "2022-11-15" as any,
});

const PLAN_PRICES: Record<string, { name: string; amount: number }> = {
  starter: { name: "Servitotal Starter", amount: 49900 }, // $499.00 MXN in cents
  pro: { name: "Servitotal Pro", amount: 89900 },         // $899.00 MXN in cents
  enterprise: { name: "Servitotal Enterprise", amount: 149900 }, // $1499.00 MXN in cents
};

export async function POST(req: Request) {
  try {
    const { planId, userId, userEmail } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json({ error: "Faltan parámetros requeridos (planId, userId)" }, { status: 400 });
    }

    const plan = PLAN_PRICES[planId.toLowerCase()] || PLAN_PRICES.pro;
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: plan.name,
              description: `Suscripción mensual al plan ${planId.toUpperCase()} de Servitotal`,
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
      success_url: `${origin}/precios/success?session_id={CHECKOUT_SESSION_ID}&planId=${planId}`,
      cancel_url: `${origin}/servicios`,
      customer_email: userEmail || undefined,
      metadata: {
        userId,
        planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Session Error:", err);
    return NextResponse.json({ error: err.message || "Error al crear la sesión de pago" }, { status: 500 });
  }
}
