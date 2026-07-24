"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/store";
import { useFirestore } from "@/lib/FirestoreContext";
import type { MenuItem } from "@/lib/types";

const DEFAULT_CATEGORIES = ["Alimentos", "Bebidas", "Postres"];

function normalizeCategories(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_CATEGORIES;
  return raw.map((item) => (typeof item === "string" ? item : (item as { name: string }).name)).filter(Boolean);
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Alimentos",
  available: true,
};

// Helper de parseo CSV
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
    restaurantConfig,
    updateRestaurantConfig,
    loadingData,
  } = useFirestore();

  // Selection states (Bulk delete)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

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
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState("");

  const categoriesList = normalizeCategories((restaurantConfig as { customCategories?: unknown })?.customCategories);

  useEffect(() => {
    setLocalCategories(categoriesList);
  }, [restaurantConfig]);

  // Funciones de selección masiva
  const handleSelectAll = () => {
    if (selectedIds.length === menu.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(menu.map((item) => item.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  async function handleBulkDeleteConfirm() {
    if (selectedIds.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteMenuItem(id)));
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar los platillos seleccionados.");
    } finally {
      setSaving(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category: categoriesList[0] || "Alimentos" });
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
      const payload = {
        name: form.name,
        description: form.description,
        price,
        category: form.category,
        available: form.available,
      };
      if (editingId) {
        await updateMenuItem(editingId, payload);
      } else {
        await addMenuItem(payload);
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
      setSelectedIds((prev) => prev.filter((id) => id !== deletingItem.id));
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

      const validated: Array<Omit<MenuItem, "id"> & { error?: string }> = rawItems.map(
        (raw) => {
          const name = String(raw.name || raw.nombre || raw.title || raw.titulo || "").trim();
          const description = String(raw.description || raw.descripcion || raw.desc || "").trim();

          let price = parseFloat(raw.price || raw.precio || "0");
          if (isNaN(price)) price = 0;

          let category = String(raw.category || raw.categoria || "Alimentos").trim();

          let available = true;
          if (raw.available !== undefined) {
            available =
              raw.available === true ||
              String(raw.available).toLowerCase() === "true" ||
              raw.available === 1 ||
              String(raw.available) === "si" ||
              String(raw.available).toLowerCase() === "sí";
          }

          const errors: string[] = [];
          if (!name) errors.push("Falta nombre");
          if (price <= 0) errors.push("Precio inválido o <= 0");

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

  function handleAddCategory() {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (localCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("La categoría ya existe");
      return;
    }
    setLocalCategories([...localCategories, trimmed]);
    setNewCatName("");
  }

  function handleDeleteCategory(catIndex: number) {
    setLocalCategories(localCategories.filter((_, idx) => idx !== catIndex));
  }

  function startEditCategory(index: number) {
    setEditingCatIndex(index);
    setEditingCatValue(localCategories[index]);
  }

  function saveEditCategory() {
    if (editingCatIndex === null) return;
    const trimmed = editingCatValue.trim();
    if (!trimmed) return;
    const updated = [...localCategories];
    updated[editingCatIndex] = trimmed;
    setLocalCategories(updated);
    setEditingCatIndex(null);
    setEditingCatValue("");
  }

  async function handleSaveCategories() {
    setSaving(true);
    try {
      await updateRestaurantConfig({ customCategories: localCategories } as Record<string, unknown>);
      setCatModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar categorías.");
    } finally {
      setSaving(false);
    }
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
        <div className="page-header__actions" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {selectedIds.length > 0 && (
            <Button variant="danger" onClick={() => setBulkDeleteModalOpen(true)}>
              🗑️ Eliminar ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => setCatModalOpen(true)}>📁 Categorías</Button>
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>🤖 Importar Menú (IA)</Button>
          <Button variant="primary" onClick={openCreate}>+ Agregar platillo</Button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="menu-admin-cards">
        {menu.map((item) => (
          <div
            key={item.id}
            className="menu-admin-card"
            style={{
              borderLeft: selectedIds.includes(item.id)
                ? "4px solid var(--color-primary, #e85d04)"
                : undefined,
            }}
          >
            <div className="menu-admin-card__header" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => handleToggleSelect(item.id)}
                style={{ width: "20px", height: "20px", cursor: "pointer", marginTop: "2px" }}
                aria-label={`Seleccionar ${item.name}`}
              />
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                <div className="text-sm text-muted">{item.description}</div>
              </div>
              <button
                type="button"
                className={`toggle ${item.available ? "toggle--on" : ""}`}
                onClick={() => toggleAvailability(item)}
                aria-label="Disponibilidad"
              >
                <span className="toggle__knob" />
              </button>
            </div>
            <div className="text-sm" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <span><strong>{formatCurrency(item.price)}</strong></span>
              <span className="badge badge--neutral" style={{ textTransform: "none" }}>{item.category}</span>
            </div>
            <div className="menu-admin-card__actions">
              <Button variant="outline" size="sm" onClick={() => openEdit(item)}>Editar</Button>
              <Button variant="danger" size="sm" onClick={() => openDeleteConfirm(item)}>Eliminar</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="menu-admin-table card card-table-wrapper" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={menu.length > 0 && selectedIds.length === menu.length}
                  onChange={handleSelectAll}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  aria-label="Seleccionar todos los platillos"
                />
              </th>
              <th>Platillo</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item) => (
              <tr
                key={item.id}
                style={{
                  backgroundColor: selectedIds.includes(item.id)
                    ? "var(--color-primary-light, #fff4ed)"
                    : undefined,
                }}
              >
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    aria-label={`Seleccionar ${item.name}`}
                  />
                </td>
                <td>
                  <strong>{item.name}</strong>
                  <div className="text-sm text-muted">{item.description}</div>
                </td>
                <td>{item.category}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>
                  <button type="button" className={`toggle ${item.available ? "toggle--on" : ""}`} onClick={() => toggleAvailability(item)} aria-label="Toggle disponibilidad">
                    <span className="toggle__knob" />
                  </button>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => openDeleteConfirm(item)}>Eliminar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar platillo" : "Nuevo platillo"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving} style={{ backgroundColor: "#e85d04", borderColor: "#e85d04" }}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ej. Tacos al Pastor" />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ingredientes y porciones..." />
          </div>
          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label">Precio (MXN)</label>
              <input type="number" className="form-input" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title="Gestionar categorías"
        footer={
          <>
            <Button variant="outline" onClick={() => setCatModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveCategories} disabled={saving} style={{ backgroundColor: "#e85d04", borderColor: "#e85d04" }}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input className="form-input" style={{ flex: 1 }} placeholder="Nueva categoría (ej. Entradas)" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            <Button variant="outline" onClick={handleAddCategory}>+ Crear</Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {localCategories.length === 0 ? (
              <p className="text-sm text-muted">No hay categorías.</p>
            ) : (
              localCategories.map((cat, idx) => (
                <div key={cat + idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-bg)" }}>
                  {editingCatIndex === idx ? (
                    <>
                      <input className="form-input" style={{ flex: 1 }} value={editingCatValue} onChange={(e) => setEditingCatValue(e.target.value)} />
                      <Button variant="primary" size="sm" onClick={saveEditCategory}>OK</Button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontWeight: 600 }}>{cat}</span>
                      <Button variant="outline" size="sm" onClick={() => startEditCategory(idx)}>Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(idx)} style={{ color: "var(--color-danger)" }}>Eliminar</Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar platillo"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={saving}>{saving ? "Eliminando..." : "Sí, eliminar"}</Button>
          </>
        }
      >
        <p>¿Eliminar <strong>{deletingItem?.name}</strong>? Esta acción no se puede deshacer.</p>
      </Modal>

      {/* Modal de confirmación para eliminación masiva */}
      <Modal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Eliminar platillos seleccionados"
        footer={
          <>
            <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleBulkDeleteConfirm} disabled={saving}>
              {saving ? "Eliminando..." : `Sí, eliminar (${selectedIds.length})`}
            </Button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar <strong>{selectedIds.length} platillos</strong> seleccionados?
          Esta acción no se puede deshacer.
        </p>
      </Modal>

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
                        <td>{item.category}</td>
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