"use client";

import { useEffect, useState } from "react";

interface FlowStep {
  id: number;
  label: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  x: number;
  y: number;
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: 1,
    label: "Mesa (Pedido)",
    icon: "📝",
    title: "1. Toma de Pedido en Mesa",
    desc: "El mesero genera el pedido digitalmente en la mesa desde cualquier móvil. La orden se envía instantáneamente.",
    color: "#e85d04", // naranja
    x: 90,
    y: 210,
  },
  {
    id: 2,
    label: "Caja (Registro)",
    icon: "💻",
    title: "2. Registro y Control en Caja",
    desc: "La comanda se registra en el POS central para cobro y arqueos. El 16% de IVA se calcula automáticamente.",
    color: "#f48c06", // amarillo/naranja
    x: 90,
    y: 90,
  },
  {
    id: 3,
    label: "Cocina (Comida)",
    icon: "🍳",
    title: "3. Preparación en Cocina",
    desc: "La orden se muestra de inmediato en la pantalla de cocina, listando platillos y especificaciones en tiempo real.",
    color: "#1a1a2e", // azul marino
    x: 310,
    y: 90,
  },
  {
    id: 4,
    label: "Comensal (Platillo)",
    icon: "🍔",
    title: "4. Entrega al Comensal",
    desc: "El platillo se sirve caliente en la mesa y se actualiza el estado a listo, cerrando el ciclo de servicio eficiente.",
    color: "#059669", // verde success
    x: 310,
    y: 210,
  },
];

export function RestaurantFlowAnimation() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev === 4 ? 1 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flow-container" style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-xl)",
      padding: "2rem",
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1.5rem",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ textAlign: "center", width: "100%" }}>
        <span className="badge badge--primary" style={{ marginBottom: "0.5rem" }}>
          Flujo de Planta (Top-Down)
        </span>
        <h3 className="heading-serif" style={{ fontSize: "1.6rem", color: "var(--color-secondary)", marginTop: "0.25rem" }}>
          ¿Cómo fluye Servitotal?
        </h3>
      </div>

      {/* SVG Diagram - Floor plan view */}
      <svg viewBox="0 0 400 300" style={{ width: "100%", maxHeight: "280px", overflow: "visible" }}>
        {/* Outer wall outline */}
        <rect x="20" y="20" width="360" height="260" rx="12" fill="none" stroke="rgba(28, 25, 23, 0.1)" strokeWidth="2" strokeDasharray="6,4" />
        
        {/* Zone 1: Caja Room */}
        <rect x="35" y="35" width="125" height="110" rx="8" fill="rgba(244, 140, 6, 0.03)" stroke="rgba(28, 25, 23, 0.08)" strokeWidth="1.5" />
        <text x="97" y="55" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-text-muted)" letterSpacing="0.05em">CAJA / RECEPCIÓN</text>
        
        {/* Zone 2: Cocina Room */}
        <rect x="240" y="35" width="125" height="110" rx="8" fill="rgba(26, 26, 46, 0.02)" stroke="rgba(28, 25, 23, 0.08)" strokeWidth="1.5" />
        <text x="302" y="55" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-text-muted)" letterSpacing="0.05em">COCINA DIGITAL</text>

        {/* Zone 3: Salon/Dining Area */}
        <rect x="35" y="160" width="330" height="105" rx="8" fill="rgba(232, 93, 4, 0.02)" stroke="rgba(28, 25, 23, 0.08)" strokeWidth="1.5" />
        <text x="200" y="250" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-text-muted)" letterSpacing="0.05em"></text>

        {/* Connection Paths (Dashed lines) */}
        {/* Mesa -> Caja */}
        <path
          d="M 90 210 L 90 90"
          fill="none"
          stroke={activeStep === 1 ? "#e85d04" : "var(--color-border)"}
          strokeWidth={activeStep === 1 ? "3.5" : "2"}
          strokeDasharray="6,4"
          style={{ transition: "all 0.3s ease" }}
        />
        {/* Caja -> Cocina */}
        <path
          d="M 90 90 L 310 90"
          fill="none"
          stroke={activeStep === 2 ? "#f48c06" : "var(--color-border)"}
          strokeWidth={activeStep === 2 ? "3.5" : "2"}
          strokeDasharray="6,4"
          style={{ transition: "all 0.3s ease" }}
        />
        {/* Cocina -> Comensal */}
        <path
          d="M 310 90 L 310 210"
          fill="none"
          stroke={activeStep === 3 ? "#1a1a2e" : "var(--color-border)"}
          strokeWidth={activeStep === 3 ? "3.5" : "2"}
          strokeDasharray="6,4"
          style={{ transition: "all 0.3s ease" }}
        />
        {/* Comensal -> Mesa */}
        <path
          d="M 310 210 L 90 210"
          fill="none"
          stroke={activeStep === 4 ? "#059669" : "var(--color-border)"}
          strokeWidth={activeStep === 4 ? "3.5" : "2"}
          strokeDasharray="6,4"
          style={{ transition: "all 0.3s ease" }}
        />

        {/* Floating pulse animations on paths */}
        {activeStep === 1 && (
          <circle r="7" fill="#e85d04" filter="drop-shadow(0 2px 4px rgba(232,93,4,0.4))">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M 90 210 L 90 90" />
          </circle>
        )}
        {activeStep === 2 && (
          <circle r="7" fill="#f48c06" filter="drop-shadow(0 2px 4px rgba(244,140,6,0.4))">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M 90 90 L 310 90" />
          </circle>
        )}
        {activeStep === 3 && (
          <circle r="7" fill="#1a1a2e" filter="drop-shadow(0 2px 4px rgba(26,26,46,0.4))">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M 310 90 L 310 210" />
          </circle>
        )}
        {activeStep === 4 && (
          <circle r="7" fill="#059669" filter="drop-shadow(0 2px 4px rgba(5,150,105,0.4))">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M 310 210 L 90 210" />
          </circle>
        )}

        {/* Nodes */}
        {FLOW_STEPS.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <g
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Outer pulsing ring for active step */}
              {isActive && (
                <circle
                  cx={step.x}
                  cy={step.y}
                  r="32"
                  fill="none"
                  stroke={step.color}
                  strokeWidth="2.5"
                  className="flow-pulse-ring"
                  style={{ opacity: 0.5 }}
                />
              )}

              {/* Node base circle */}
              <circle
                cx={step.x}
                cy={step.y}
                r="24"
                fill={isActive ? step.color : "white"}
                stroke={isActive ? step.color : "var(--color-border)"}
                strokeWidth="2.5"
                style={{
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  filter: isActive ? "drop-shadow(0 6px 12px rgba(0,0,0,0.15))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.05))"
                }}
              />

              {/* Node Icon */}
              <text
                x={step.x}
                y={step.y + 6}
                textAnchor="middle"
                fontSize="16"
                style={{
                  userSelect: "none"
                }}
              >
                {step.icon}
              </text>

              {/* Node Label Text */}
              <text
                x={step.x}
                y={step.y + 38}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={isActive ? "var(--color-text)" : "var(--color-text-muted)"}
                style={{ transition: "fill 0.3s ease" }}
              >
                {step.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Details Box */}
      <div style={{
        width: "100%",
        minHeight: "90px",
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "1rem 1.25rem",
        textAlign: "left",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        borderLeft: `5px solid ${FLOW_STEPS[activeStep - 1].color}`
      }}>
        <h4 style={{
          fontWeight: 700,
          color: "var(--color-secondary)",
          marginBottom: "0.25rem",
          fontSize: "1rem"
        }}>
          {FLOW_STEPS[activeStep - 1].title}
        </h4>
        <p className="text-sm text-muted" style={{ lineHeight: "1.5" }}>
          {FLOW_STEPS[activeStep - 1].desc}
        </p>
      </div>

      {/* Manual Steps Indicators */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[1, 2, 3, 4].map((id) => (
          <button
  type="button"
  aria-label="Paso 1"
  style={{
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    padding: "18px", // 🟢 Agranda el área táctil total a ~48px sin deformar el botón
    margin: "0 4px",
    boxSizing: "content-box",
    backgroundClip: "content-box", // 🟢 Mantiene el color solo en los 12px del centro
    border: "none",
    cursor: "pointer",
  }}
/>
        ))}
      </div>
    </div>
  );
}
