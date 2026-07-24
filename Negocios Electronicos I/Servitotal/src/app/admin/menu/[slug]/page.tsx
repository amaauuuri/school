"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MenuItem {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  disponible: boolean;
}

interface RestaurantInfo {
  name: string;
  phone?: string;
  address?: string;
}

export default function PublicMenuPage({ params }: { params: { slug: string } }) {
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  useEffect(() => {
    async function fetchPublicMenu() {
      try {
        // 1. Buscar restaurante por slug o ID
        const qRest = query(
          collection(db, "restaurants"),
          where("slug", "==", params.slug)
        );
        const restSnap = await getDocs(qRest);

        if (!restSnap.empty) {
          const restDoc = restSnap.docs[0];
          const restData = restDoc.data() as RestaurantInfo;
          setRestaurant(restData);

          // 2. Cargar menú de ese restaurante
          const qMenu = query(
            collection(db, "menu_items"),
            where("restaurantId", "==", restDoc.id),
            where("disponible", "==", true)
          );
          const menuSnap = await getDocs(qMenu);
          const items = menuSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
          setMenuItems(items);
        }
      } catch (err) {
        console.error("Error al cargar menú público:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicMenu();
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#666" }}>
        Cargando menú digital...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>
        El menú solicitado no existe o no se encuentra disponible.
      </div>
    );
  }

  const categories = ["Todos", ...Array.from(new Set(menuItems.map((i) => i.categoria)))];
  const filteredItems = activeCategory === "Todos" 
    ? menuItems 
    : menuItems.filter((i) => i.categoria === activeCategory);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif", backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* Header del Restaurante */}
      <header style={{ textAlign: "center", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
        <h1 style={{ color: "#e85d04", margin: "0 0 5px 0", fontSize: "1.75rem" }}>{restaurant.name}</h1>
        {restaurant.address && <p style={{ color: "#666", fontSize: "0.85rem", margin: 0 }}>📍 {restaurant.address}</p>}
        {restaurant.phone && <p style={{ color: "#666", fontSize: "0.85rem", margin: "3px 0 0 0" }}>📞 {restaurant.phone}</p>}
      </header>

      {/* Categorías en horizontal */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "15px 0", borderBottom: "1px solid #f0f0f0" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: activeCategory === cat ? "#e85d04" : "#f3f4f6",
              color: activeCategory === cat ? "#fff" : "#374151",
              fontWeight: 500,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
              cursor: "pointer"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Platillos */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
        {filteredItems.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "12px", borderBottom: "1px solid #f9fafb" }}>
            <div style={{ paddingRight: "10px" }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1rem", color: "#111827" }}>{item.nombre}</h3>
              {item.descripcion && <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{item.descripcion}</p>}
            </div>
            <div style={{ fontWeight: "bold", color: "#e85d04", fontSize: "1rem" }}>
              ${item.precio.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", borderTop: "1px solid #eee", paddingTop: "15px" }}>
        Menú digital provisto por <strong>Servitotal POS</strong>
      </footer>
    </div>
  );
}