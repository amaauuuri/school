import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { PRICING_PLANS } from "@/lib/mock-data";

export default function PreciosPage() {
  return (
    <PublicLayout>
      <section className="section" style={{ paddingTop: "3rem" }}>
        <div className="container">
          <div className="section__header">
            <h1 className="section__title heading-serif">
              Planes simples, sin sorpresas
            </h1>
            <p className="text-muted text-lg">
              Elige el plan que se adapte al tamaño de tu operación. Todos
              incluyen soporte y actualizaciones.
            </p>
          </div>

          <div className="pricing-grid">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card ${
                  plan.highlighted ? "pricing-card--highlighted" : ""
                }`}
              >
                {plan.highlighted && (
                  <span className="pricing-card__badge">Más popular</span>
                )}
                <h2 className="pricing-card__name">{plan.name}</h2>
                <p className="text-muted text-sm">{plan.description}</p>
                <div className="pricing-card__price">
                  ${plan.price}
                  <span> / {plan.period}</span>
                </div>
                <ul className="pricing-card__features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link href="/registro">
                  <Button
                    variant={plan.highlighted ? "primary" : "outline"}
                    block
                  >
                    Empezar con {plan.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
