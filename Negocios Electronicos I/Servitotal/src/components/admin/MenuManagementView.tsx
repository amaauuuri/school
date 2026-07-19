"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  CATEGORY_LABELS,
  formatCurrency,
  useServitotalStore,
} from "@/lib/store";
import type { MenuCategory, MenuItem } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "alimentos" as MenuCategory,
  available: true,
};

export function MenuManagementView() {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem } =
    useServitotalStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  function handleSave() {
    const price = parseFloat(form.price);
    if (!form.name || isNaN(price)) return;

    if (editingId) {
      updateMenuItem(editingId, {
        name: form.name,
        description: form.description,
        price,
        category: form.category,
        available: form.available,
      });
    } else {
      addMenuItem({
        name: form.name,
        description: form.description,
        price,
        category: form.category,
        available: form.available,
      });
    }
    setModalOpen(false);
  }

  function toggleAvailability(item: MenuItem) {
    updateMenuItem(item.id, { available: !item.available });
  }

  return (
    <>
      <div className="page-header">
        <p className="text-muted">{menu.length} platillos en el menú</p>
        <div className="page-header__actions">
          <Button variant="primary" onClick={openCreate}>
            + Agregar platillo
          </Button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(item)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteMenuItem(item.id)}
                    >
                      Eliminar
                    </Button>
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
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Guardar
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
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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
                  setForm({
                    ...form,
                    category: e.target.value as MenuCategory,
                  })
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
    </>
  );
}
