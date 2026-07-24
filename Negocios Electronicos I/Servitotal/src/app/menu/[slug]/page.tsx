"use client";

import { useEffect, useState, use } from "react";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MenuItem {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  imagen?: string;
}

interface RestaurantInfo {
  name: string;
  phone?: string;
  address?: string;
}

// 🎯 Banco de imágenes curadas por categoría + asignador de unicidad por ID
const FOOD_COLLECTIONS: Record<string, string[]> = {
  tacos: [
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b",
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47",
    "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c",
    "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f"
  ],
  burger: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90",
    "https://images.unsplash.com/photo-1550547660-d9450f859349"
  ],
  pizza: [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
  ],
  mexican: [
    "https://images.unsplash.com/photo-1599789197514-47270cd526b4",
    "https://images.unsplash.com/photo-1584208124888-3a20b9c799e2",
    "https://images.unsplash.com/photo-1613514785940-daed07799d9b"
  ],
  coffee: [
    "https://images.unsplash.com/photo-1534778101976-62847782c213",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93"
  ],
  drink: [
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
    "https://images.unsplash.com/photo-1608270586620-248524c67de9",
    "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87"
  ],
  dessert: [
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
    "https://images.unsplash.com/photo-1560008581-09826d1de69e",
    "https://images.unsplash.com/photo-1587314168485-3236d6710814"
  ],
  general: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d"
  ]
};

function getAccurateDishImage(nombre: string, categoria: string, id: string): string {
  const cleanName = nombre.toLowerCase().trim();
  const cleanCat = categoria.toLowerCase().trim();

  let collectionKey = "general";

  if (cleanName.includes("taco")) collectionKey = "tacos";
  else if (cleanName.includes("hamburguesa") || cleanName.includes("burger")) collectionKey = "burger";
  else if (cleanName.includes("pizza")) collectionKey = "pizza";
  else if (cleanName.includes("chilaquil") || cleanName.includes("enchilada")) collectionKey = "mexican";
  else if (cleanName.includes("latte") || cleanName.includes("capuchino") || cleanName.includes("cafe")) collectionKey = "coffee";
  else if (cleanCat.includes("bebida") || cleanCat.includes("drink")) collectionKey = "drink";
  else if (cleanCat.includes("postre") || cleanCat.includes("dessert")) collectionKey = "dessert";

  const pool = FOOD_COLLECTIONS[collectionKey] || FOOD_COLLECTIONS.general;

  // Calculamos un índice invariable a partir del ID para que el mismo platillo siempre tenga la misma foto
  const charCodeSum = Array.from(id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const selectedUrl = pool[charCodeSum % pool.length];

  return `${selectedUrl}?auto=format&fit=crop&w=300&q=80`;
}

export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  useEffect(() => {
    async function fetchPublicMenu() {
      try {
        let restData: RestaurantInfo | null = null;
        let rawItems: any[] = [];

        // 1. Obtener datos del restaurante / usuario
        const userRef = doc(db, "users", slug);
        const userSnap = await getDoc(userRef);

        const restRef = doc(db, "restaurants", slug);
        const restSnap = await getDoc(restRef);

        if (restSnap.exists()) {
          const r = restSnap.data();
          restData = { name: r.name || r.restaurantName, phone: r.phone, address: r.address };
        } else if (userSnap.exists()) {
          const u = userSnap.data();
          restData = {
            name: u.restaurantName || u.name || "Mi Restaurante",
            phone: u.phone || "",
            address: u.address || "",
          };
        }

        if (restData) {
          setRestaurant(restData);

          // 2. Cargar datos de subcolecciones
          const subColMenuSnap = await getDocs(collection(db, "users", slug, "menu"));
          if (!subColMenuSnap.empty) {
            rawItems = subColMenuSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          } else {
            const subColMenuItemsSnap = await getDocs(collection(db, "users", slug, "menu_items"));
            if (!subColMenuItemsSnap.empty) {
              rawItems = subColMenuItemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            }
          }

          if (rawItems.length === 0) {
            const subColRestMenuSnap = await getDocs(collection(db, "restaurants", slug, "menu"));
            if (!subColRestMenuSnap.empty) {
              rawItems = subColRestMenuSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            }
          }

          if (rawItems.length === 0) {
            const globalMenuQuery = query(collection(db, "menu_items"), where("userId", "==", slug));
            const globalSnap = await getDocs(globalMenuQuery);
            if (!globalSnap.empty) {
              rawItems = globalSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            } else {
              const globalRestQuery = query(collection(db, "menu_items"), where("restaurantId", "==", slug));
              const globalRestSnap = await getDocs(globalRestQuery);
              if (!globalRestSnap.empty) {
                rawItems = globalRestSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
              }
            }
          }

          // 3. Formatear platillos asignando imágenes inteligentes e individuales
          const items: MenuItem[] = rawItems.map((item: any, idx: number) => {
            const itemId = String(item.id || idx);
            const itemNombre = item.name || item.nombre || "Platillo";
            const itemCategoria = item.category || item.categoria || "Alimentos";

            // Si el admin subió su propia foto (image/imagen/imageUrl), la respeta. Si no, usa la precisa de Unsplash.
            const finalImage =
              item.image ||
              item.imagen ||
              item.imageUrl ||
              getAccurateDishImage(itemNombre, itemCategoria, itemId);

            return {
              id: itemId,
              nombre: itemNombre,
              descripcion: item.description || item.descripcion || "",
              precio: Number(item.price || item.precio || 0),
              categoria: itemCategoria,
              disponible:
                item.available !== undefined
                  ? item.available
                  : item.disponible !== undefined
                  ? item.disponible
                  : true,
              imagen: finalImage,
            };
          });

          setMenuItems(items);
        }
      } catch (err) {
        console.error("Error al cargar menú público:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPublicMenu();
    }
  }, [slug]);

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
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Header del Restaurante */}
      <header style={{ textAlign: "center", backgroundColor: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h1 style={{ color: "#e85d04", margin: "0 0 5px 0", fontSize: "1.75rem" }}>{restaurant.name}</h1>
        {restaurant.address && <p style={{ color: "#666", fontSize: "0.85rem", margin: 0 }}>📍 {restaurant.address}</p>}
        {restaurant.phone && <p style={{ color: "#666", fontSize: "0.85rem", margin: "3px 0 0 0" }}>📞 {restaurant.phone}</p>}
      </header>

      {/* Categorías en horizontal */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "15px 0" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: activeCategory === cat ? "#e85d04" : "#fff",
              color: activeCategory === cat ? "#fff" : "#374151",
              fontWeight: 600,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
              cursor: "pointer",
              boxShadow: activeCategory === cat ? "0 2px 4px rgba(232, 93, 4, 0.3)" : "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Platillos */}
      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredItems.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.9rem", marginTop: "20px" }}>
            No hay platillos registrados en este menú aún.
          </p>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                display: "flex", 
                gap: "14px", 
                alignItems: "center", 
                padding: "12px", 
                borderRadius: "14px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: "1px solid #f3f4f6"
              }}
            >
              <img 
                src={item.imagen} 
                alt={item.nombre} 
                loading="lazy"
                decoding="async"
                width={75} 
                height={75}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=150&q=80";
                }}
                style={{ 
                  width: "75px", 
                  height: "75px", 
                  objectFit: "cover", 
                  borderRadius: "10px",
                  backgroundColor: "#fff3ec",
                  flexShrink: 0
                }} 
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#111827", fontWeight: 600 }}>
                    {item.nombre}
                  </h3>
                  <span style={{ fontWeight: "bold", color: "#e85d04", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
                    ${item.precio.toFixed(2)}
                  </span>
                </div>
                {item.descripcion && (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280", lineHeight: "1.3" }}>
                    {item.descripcion}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: "15px" }}>
        Menú digital provisto por <strong>Servitotal POS</strong>
      </footer>
    </div>
  );
}