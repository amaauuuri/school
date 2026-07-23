"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CATEGORY_LABELS, formatCurrency } from "@/lib/store";
import { useFirestore } from "@/lib/FirestoreContext";
import type { MenuCategory, MenuItem } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "alimentos" as MenuCategory,
  available: true,
};

// Robust CSV Parsing helper
function parseCSV(text: string): any[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const splitCSVRow = (rowText: string) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitCSVRow(lines[0]).map((h) =>
    h.replace(/^['"]|['"]$/g, "").toLowerCase().trim()
  );
  const items: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVRow(lines[i]);
    const item: Record<string, any> = {};
    headers.forEach((header, index) => {
      const val = values[index] ? values[index].replace(/^['"]|['"]$/g, "").trim() : "";
      item[header] = val;
    });
    items.push(item);
  }
  return items;
}

export function MenuManagementView() {
  const {
    menu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    importMenuItemsBatch,
    loadingData,
  } = useFirestore();

  // Create / Edit states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Import states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedItems, setParsedItems] = useState<
    Array<Omit<MenuItem, "id"> & { error?: string }>
  >([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      available: item.available,
    });
    setModalOpen(true);
  }

  function openDeleteConfirm(item: MenuItem) {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  }

  async function handleSave() {
    const price = parseFloat(form.price);
    if (!form.name || isNaN(price)) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateMenuItem(editingId, {
          name: form.name,
          description: form.description,
          price,
          category: form.category,
          available: form.available,
        });
      } else {
        await addMenuItem({
          name: form.name,
          description: form.description,
          price,
          category: form.category,
          available: form.available,
        });
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await deleteMenuItem(deletingItem.id);
      setDeleteModalOpen(false);
      setDeletingItem(null);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item: MenuItem) {
    await updateMenuItem(item.id, { available: !item.available });
  }

  // AI Import handling
  const handleFileParse = async (file: File) => {
    setImportError(null);
    setParsedItems([]);
    try {
      const text = await file.text();
      let rawItems: any[] = [];

      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        rawItems = Array.isArray(parsed) ? parsed : parsed.items || parsed.menu || [];
      } else if (file.name.endsWith(".csv")) {
        rawItems = parseCSV(text);
      } else {
        // Fallback detection
        try {
          const parsed = JSON.parse(text);
          rawItems = Array.isArray(parsed) ? parsed : parsed.items || parsed.menu || [];
        } catch {
          rawItems = parseCSV(text);
        }
      }

      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        throw new Error("No se encontraron platillos en el archivo o el formato es inválido.");
      }

      // Map and validate items
      const validated: Array<Omit<MenuItem, "id"> & { error?: string }> = rawItems.map(
        (raw) => {
          const name = String(
            raw.name || raw.nombre || raw.title || raw.titulo || ""
          ).trim();
          const description = String(
            raw.description || raw.descripcion || raw.desc || ""
          ).trim();

          let price = parseFloat(raw.price || raw.precio || "0");
          if (isNaN(price)) price = 0;

          // Map categories intelligently
          let category: MenuCategory = "alimentos";
          const rawCategory = String(raw.category || raw.categoria || "")
            .trim()
            .toLowerCase();
          if (
            rawCategory.startsWith("beb") ||
            rawCategory.startsWith("drink") ||
            rawCategory.startsWith("coct") ||
            rawCategory.startsWith("refres")
          ) {
            category = "bebidas";
          } else if (
            rawCategory.startsWith("post") ||
            rawCategory.startsWith("dess") ||
            rawCategory.startsWith("dulce")
          ) {
            category = "postres";
          }

          let available = true;
          if (raw.available !== undefined) {
            available =
              raw.available === true ||
              String(raw.available).toLowerCase() === "true" ||
              raw.available === 1 ||
              String(raw.available) === "si" ||
              String(raw.available).toLowerCase() === "sí";
          } else if (raw.disponible !== undefined) {
            available =
              raw.disponible === true ||
              String(raw.disponible).toLowerCase() === "true" ||
              raw.disponible === 1 ||
              String(raw.disponible) === "si" ||
              String(raw.disponible).toLowerCase() === "sí";
          }

          const errors: string[] = [];
          if (!name) {
            errors.push("Falta nombre");
          }
          if (price <= 0) {
            errors.push("Precio inválido o <= 0");
          }

          return {
            name,
            description,
            price,
            category,
            available,
            error: errors.length > 0 ? errors.join(", ") : undefined,
          };
        }
      );

      setParsedItems(validated);
    } catch (err: any) {
      setImportError(err.message || "Error al leer o interpretar el archivo.");
    }
  };

  async function handleImportConfirm() {
    if (parsedItems.length === 0 || parsedItems.some((i) => i.error)) return;
    setImporting(true);
    setImportError(null);
    try {
      // Remove validation wrapper attributes
      const cleanItems = parsedItems.map(({ error, ...item }) => item);
      await importMenuItemsBatch(cleanItems);
      closeImportModal();
    } catch (err: any) {
      setImportError(err.message || "Error al realizar la importación masiva.");
    } finally {
      setImporting(false);
    }
  }

  function closeImportModal() {
    setImportModalOpen(false);
    setParsedItems([]);
    setImportError(null);
    setIsDragging(false);
  }

  if (loadingData) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-text-muted)", textAlign: "center" }}>
        Cargando menú...
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <p className="text-muted">{menu.length} platillos en el menú</p>
        <div className="page-header__actions" style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            🤖 Importar Menú (IA)
          </Button>
          <Button variant="primary" onClick={openCreate}>
            + Agregar platillo
          </Button>
        </div>
      </div>

      <div className="card card-table-wrapper" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Platillo</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <div className="text-sm text-muted">{item.description}</div>
                </td>
                <td>{CATEGORY_LABELS[item.category]}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>
                  <button
                    type="button"
                    className={`toggle ${item.available ? "toggle--on" : ""}`}
                    onClick={() => toggleAvailability(item)}
                    aria-label="Toggle disponibilidad"
                  >
                    <span className="toggle__knob" />
                  </button>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => openDeleteConfirm(item)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar platillo" : "Nuevo platillo"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label">Precio (MXN)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as MenuCategory })
                }
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar platillo"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={saving}>
              {saving ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar{" "}
          <strong>{deletingItem?.name}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>

      {/* ── AI Import Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={importModalOpen}
        onClose={closeImportModal}
        title="🤖 Importación Masiva (IA)"
        footer={
          <>
            <Button variant="outline" onClick={closeImportModal} disabled={importing}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleImportConfirm}
              disabled={importing || parsedItems.length === 0 || parsedItems.some((i) => i.error)}
            >
              {importing
                ? "Importando..."
                : `Confirmar Importación (${parsedItems.length} platillos)`}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p className="text-sm text-muted">
            Sube el archivo <strong>CSV</strong> o <strong>JSON</strong> generado por la IA a partir del menú físico.
            El archivo debe incluir las columnas: <code>name</code>, <code>description</code>,{" "}
            <code>price</code>, <code>category</code> y <code>available</code>.
          </p>

          <div
            className={`import-dropzone ${isDragging ? "import-dropzone--active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileParse(file);
            }}
            onClick={() => document.getElementById("import-file-input")?.click()}
          >
            <div className="import-dropzone__icon">📁</div>
            <div className="import-dropzone__title">Arrastra y suelta tu archivo aquí</div>
            <div className="import-dropzone__subtitle">
              o haz clic para explorar en tu equipo (.csv, .json)
            </div>
            <input
              id="import-file-input"
              type="file"
              accept=".csv,.json"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileParse(file);
              }}
            />
          </div>

          {importError && (
            <div
              className="badge badge--danger"
              style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", textTransform: "none", width: "100%" }}
            >
              ⚠️ {importError}
            </div>
          )}

          {parsedItems.length > 0 && (
            <div className="import-preview-container">
              <div className="import-preview-header">
                <span>Platillos detectados ({parsedItems.length})</span>
                {parsedItems.some((i) => i.error) && (
                  <span style={{ color: "var(--color-danger)", fontSize: "0.75rem" }}>
                    Corrija las filas con error
                  </span>
                )}
              </div>
              <div className="import-preview-table-wrapper">
                <table className="import-preview-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <strong>
                            {item.name || <span style={{ color: "red" }}>[Vacío]</span>}
                          </strong>
                          <div className="text-sm text-muted">{item.description}</div>
                        </td>
                        <td>{CATEGORY_LABELS[item.category]}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>
                          {item.error ? (
                            <span
                              className="import-preview-badge import-preview-badge--error"
                              title={item.error}
                            >
                              Error
                            </span>
                          ) : (
                            <span className="import-preview-badge import-preview-badge--valido">
                              Listo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

