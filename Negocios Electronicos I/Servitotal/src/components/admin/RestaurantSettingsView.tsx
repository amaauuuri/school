"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useFirestore } from "@/lib/FirestoreContext";
import { useAuth, UserProfile } from "@/lib/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface StaffMember extends UserProfile {}

// Helper seguro para determinar el límite de mesas según el plan activo
function getMaxTablesByPlan(planId?: any): number {
  const currentPlan = String(planId || "starter").toLowerCase();
  
  if (currentPlan.includes("pro")) return 25;
  if (currentPlan.includes("enterprise") || currentPlan.includes("ilimitado")) return 50;
  return 8; // Plan Starter / Básico por defecto
}

export function RestaurantSettingsView() {
  const { restaurantConfig, updateRestaurantConfig, loadingData } = useFirestore();
  const { profile, createStaffAccount } = useAuth();

  // Límite máximo según la suscripción
  const maxAllowedTables = getMaxTablesByPlan((restaurantConfig as any)?.planId);

  // Config form
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    tableCount: 8,
    taxRate: 0.16,
  });

  // Keep form in sync with live restaurantConfig
  useEffect(() => {
    if (restaurantConfig) {
      const maxTables = getMaxTablesByPlan((restaurantConfig as any)?.planId);
      setForm({
        name: restaurantConfig.name || "",
        address: restaurantConfig.address || "",
        phone: restaurantConfig.phone || "",
        email: restaurantConfig.email || "",
        tableCount: Math.min(maxTables, restaurantConfig.tableCount || 8),
        taxRate: 0.16, // Always fixed at 16%
      });
    }
  }, [restaurantConfig]);

  async function handleSendMonthlyReport() {
    if (!form.email && !restaurantConfig?.email) {
      setReportStatus("⚠️ Primero ingresa un correo de contacto arriba.");
      return;
    }
  
    setSendingReport(true);
    setReportStatus("");
  
    try {
      // 1. Obtener el rango de fechas para el mes actual
      const now = new Date();
      const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // Consulta a sales_history de Firestore del mes actual
      const q = query(
        collection(db, "sales_history"),
        where("restaurantId", "==", profile?.uid),
        where("closedAt", ">=", firstDayMonth)
      );
      const snap = await getDocs(q);
  
      let totalSales = 0;
      let totalTips = 0;
      let totalOrders = snap.docs.length;
      const dishCountMap: Record<string, number> = {};
  
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        totalSales += data.totalAmount || 0;
        totalTips += data.tip || 0;
  
        // Calcular más vendidos
        if (Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
            dishCountMap[item.nombre] = (dishCountMap[item.nombre] || 0) + item.cantidad;
          });
        }
      });
  
      // Ordenar Top 3 platos
      const topDishes = Object.entries(dishCountMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);
  
      const monthName = now.toLocaleString("es-MX", { month: "long", year: "numeric" });
  
      // 2. Disparar API de correo
      const res = await fetch("/api/send-monthly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email || profile?.email,
          restaurantName: form.name || "Tu Restaurante",
          monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          totalSales,
          totalOrders,
          totalTips,
          topDishes,
        }),
      });
  
      if (!res.ok) throw new Error("Error al procesar el correo.");
  
      setReportStatus("✅ ¡Reporte enviado con éxito a tu correo!");
      setTimeout(() => setReportStatus(""), 4000);
    } catch (err: any) {
      setReportStatus("❌ Hubo un error al enviar el reporte.");
      console.error(err);
    } finally {
      setSendingReport(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRestaurantConfig({
        ...form,
        tableCount: Math.min(maxAllowedTables, Math.max(1, form.tableCount)),
        taxRate: 0.16, // Always enforce 16% IVA
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  // Staff management
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");
  const [submittingStaff, setSubmittingStaff] = useState(false);

  const fetchStaff = async () => {
    if (!profile?.restaurantName) return;
    setLoadingStaff(true);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "STAFF"),
        where("restaurantName", "==", profile.restaurantName)
      );
      const snap = await getDocs(q);
      setStaffMembers(snap.docs.map((d) => d.data() as StaffMember));
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [profile]);

  async function handleAddStaff(e: FormEvent) {
    e.preventDefault();
    setStaffError("");
    setStaffSuccess("");
    setSubmittingStaff(true);
    try {
      await createStaffAccount(staffName, staffEmail, staffPassword);
      setStaffSuccess("¡Personal registrado! Se envió un correo de verificación.");
      setStaffName("");
      setStaffEmail("");
      setStaffPassword("");
      await fetchStaff();
      setTimeout(() => {
        setShowAddForm(false);
        setStaffSuccess("");
      }, 3000);
    } catch (err: any) {
      setStaffError(err.message ?? "Error al crear la cuenta del personal.");
    } finally {
      setSubmittingStaff(false);
    }
  }

  if (loadingData) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-text-muted)", textAlign: "center" }}>
        Cargando configuración...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Config Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid--2">
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Datos del negocio</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nombre del restaurante</label>
                <input
                  className="form-input"
                  placeholder="ej. La Cocina de María"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input
                  className="form-input"
                  placeholder="Ingresa la dirección física del restaurante (ej. Av. Reforma #123, Col. Centro, Puebla)"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="form-row form-row--2">
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-input"
                    placeholder="ej. 5512345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo de contacto</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="contacto@restaurante.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Capacidad y Configuración</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Número de mesas en el restaurante</label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  max={maxAllowedTables}
                  value={form.tableCount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tableCount: Math.min(maxAllowedTables, Math.max(1, parseInt(e.target.value) || 1)),
                    })
                  }
                />
                <span className="text-sm text-muted">
                  Plan actual: <strong>{String((restaurantConfig as any)?.planId || "STARTER").toUpperCase()}</strong> (Máximo {maxAllowedTables} mesas).
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Tasa de Impuesto (IVA)</label>
                <input
                  type="text"
                  className="form-input"
                  value="16% (IVA Fijo)"
                  readOnly
                  disabled
                  style={{
                    background: "var(--color-bg)",
                    color: "var(--color-text-muted)",
                    fontWeight: 600,
                    cursor: "not-allowed",
                  }}
                />
                <span className="text-sm text-muted">
                  Tasa impositiva del 16% de IVA no modificable para cumplimiento de reglamentos.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
          {saved && (
            <span className="text-sm" style={{ color: "var(--color-success)" }}>
              ✓ Cambios guardados
            </span>
          )}
        </div>
      </form>

      {/* TARJETA REPORTE FINANCIERO POR CORREO */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Reporte Financiero Mensual</h3>
            <p className="text-sm text-muted">
              Envía un resumen ejecutivo con el acumulado de ventas, comandas y propinas del mes actual a <strong>{form.email || "tu correo"}</strong>.
            </p>
          </div>
          <Button 
            type="button"
            onClick={handleSendMonthlyReport} 
            variant="outline" 
            disabled={sendingReport}
            style={{ borderColor: "#e85d04", color: "#e85d04", whiteSpace: "nowrap" }}
          >
            {sendingReport ? "Enviando..." : "📩 Enviar reporte ahora"}
          </Button>
        </div>
        {reportStatus && (
          <div style={{ marginTop: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
            {reportStatus}
          </div>
        )}
      </div>

      {/* Staff Section */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3 style={{ fontWeight: 600 }}>Personal del Restaurante</h3>
            <p className="text-sm text-muted">Meseros y cajeros con acceso a la vista operativa.</p>
          </div>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} variant="outline">
              + Agregar miembro
            </Button>
          )}
        </div>

        {showAddForm ? (
          <form
            onSubmit={handleAddStaff}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding: "1.25rem",
              background: "var(--color-bg)",
              maxWidth: "500px",
            }}
          >
            <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>Registrar miembro de personal</h4>
            {staffError && (
              <div style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", marginBottom: "1rem", fontWeight: 500 }}>
                {staffError}
              </div>
            )}
            {staffSuccess && (
              <div style={{ background: "var(--color-success-light)", color: "var(--color-success)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", marginBottom: "1rem", fontWeight: 500 }}>
                {staffSuccess}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="staffName">Nombre completo</label>
                <input
                  id="staffName"
                  type="text"
                  className="form-input"
                  placeholder="Juan Pérez"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  required
                  disabled={submittingStaff}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staffEmail">Correo electrónico</label>
                <input
                  id="staffEmail"
                  type="email"
                  className="form-input"
                  placeholder="juan@restaurante.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                  disabled={submittingStaff}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staffPassword">Contraseña de acceso</label>
                <input
                  id="staffPassword"
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  required
                  disabled={submittingStaff}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} disabled={submittingStaff}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={submittingStaff}>
                  {submittingStaff ? "Registrando..." : "Crear cuenta"}
                </Button>
              </div>
            </div>
          </form>
        ) : loadingStaff ? (
          <div className="text-sm text-muted">Cargando personal...</div>
        ) : staffMembers.length === 0 ? (
          <div className="text-sm text-muted" style={{ padding: "1rem 0" }}>
            No hay miembros de personal registrados aún.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9375rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)", fontWeight: 600 }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Nombre</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Correo</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Rol</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Fecha de alta</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((m) => (
                  <tr key={m.uid} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: 500 }}>{m.name}</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>{m.email}</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <span className="badge badge--neutral" style={{ fontSize: "0.7rem" }}>{m.role}</span>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                      {new Date(m.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}