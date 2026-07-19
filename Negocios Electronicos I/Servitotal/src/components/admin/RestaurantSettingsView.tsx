"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useFirestore } from "@/lib/FirestoreContext";
import { useAuth, UserProfile } from "@/lib/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface StaffMember extends UserProfile {}

export function RestaurantSettingsView() {
  const { restaurantConfig, updateRestaurantConfig, loadingData } = useFirestore();
  const { profile, createStaffAccount } = useAuth();

  // Config form
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    tableCount: 12,
    taxRate: 0.16,
  });

  // Keep form in sync with live restaurantConfig
  useEffect(() => {
    if (restaurantConfig) {
      setForm({
        name: restaurantConfig.name,
        address: restaurantConfig.address,
        phone: restaurantConfig.phone,
        email: restaurantConfig.email,
        tableCount: restaurantConfig.tableCount,
        taxRate: restaurantConfig.taxRate,
      });
    }
  }, [restaurantConfig]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRestaurantConfig(form);
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

  useEffect(() => { fetchStaff(); }, [profile]);

  async function handleAddStaff(e: FormEvent) {
    e.preventDefault();
    setStaffError("");
    setStaffSuccess("");
    setSubmittingStaff(true);
    try {
      await createStaffAccount(staffName, staffEmail, staffPassword);
      setStaffSuccess("¡Personal registrado! Se envió un correo de verificación.");
      setStaffName(""); setStaffEmail(""); setStaffPassword("");
      await fetchStaff();
      setTimeout(() => { setShowAddForm(false); setStaffSuccess(""); }, 3000);
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
      {/* ── Config form ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid--2">
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Datos del negocio</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nombre del restaurante</label>
                <input className="form-input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input className="form-input" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-row form-row--2">
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo</label>
                  <input type="email" className="form-input" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Operación</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Número de mesas</label>
                <input type="number" className="form-input" min={1} max={50}
                  value={form.tableCount}
                  onChange={(e) => setForm({ ...form, tableCount: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tasa de IVA ({(form.taxRate * 100).toFixed(0)}%)</label>
                <input type="range" min={0} max={0.25} step={0.01}
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) })}
                  style={{ width: "100%" }} />
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

      {/* ── Staff section ────────────────────────────────────────────────────── */}
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
          <form onSubmit={handleAddStaff}
            style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "1.25rem", background: "var(--color-bg)", maxWidth: "500px" }}>
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
                <input id="staffName" type="text" className="form-input" placeholder="Juan Pérez"
                  value={staffName} onChange={(e) => setStaffName(e.target.value)}
                  required disabled={submittingStaff} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staffEmail">Correo electrónico</label>
                <input id="staffEmail" type="email" className="form-input" placeholder="juan@restaurante.com"
                  value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)}
                  required disabled={submittingStaff} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="staffPassword">Contraseña de acceso</label>
                <input id="staffPassword" type="password" className="form-input" placeholder="Mínimo 8 caracteres"
                  minLength={8} value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)}
                  required disabled={submittingStaff} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button type="submit" variant="primary" disabled={submittingStaff}>
                  {submittingStaff ? "Creando cuenta..." : "Guardar miembro"}
                </Button>
                <Button type="button" variant="ghost"
                  onClick={() => { setShowAddForm(false); setStaffError(""); setStaffSuccess(""); }}
                  disabled={submittingStaff}>
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        ) : loadingStaff ? (
          <div className="text-muted text-sm" style={{ padding: "1rem 0" }}>Cargando personal...</div>
        ) : staffMembers.length === 0 ? (
          <div style={{ background: "var(--color-bg)", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-sm)", padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
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
