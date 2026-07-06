import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Utensils, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Check, 
  ChevronLeft, 
  Server, 
  Smartphone, 
  X, 
  AlertCircle 
} from "lucide-react";
import { isFirebaseConfigured, subscribeToActiveOrders } from "./firebase";
import type { Table, Product, Order, OrderItem } from "./types";
import { Timestamp } from "firebase/firestore";

// Helper to simulate Firestore Timestamps when running in mock memory mode
const createMockTimestamp = (date = new Date()): Timestamp => {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1e6,
    toDate: () => date,
    toMillis: () => date.getTime(),
    isEqual: (other: Timestamp) => other.seconds === Math.floor(date.getTime() / 1000)
  } as Timestamp;
};

// Initial Mock Menu Products
const INITIAL_PRODUCTS: Product[] = [
  { id: "p1", name: "Garlic Bread", description: "Toasted baguette with garlic butter and herbs", price: 75.00, category: "Appetizers", imageUrl: null, inStock: true, preparationStation: "cold_station", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() },
  { id: "p2", name: "Chicken Wings", description: "8 crispy buffalo wings served with ranch sauce", price: 135.00, category: "Appetizers", imageUrl: null, inStock: true, preparationStation: "kitchen", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() },
  { id: "p3", name: "Pepperoni Pizza", description: "Classy tomato base, mozzarella, and spicy pepperoni", price: 195.00, category: "Mains", imageUrl: null, inStock: true, preparationStation: "oven", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() },
  { id: "p4", name: "Double Cheese Burger", description: "Two beef patties, cheddar, pickles, house sauce", price: 165.00, category: "Mains", imageUrl: null, inStock: true, preparationStation: "kitchen", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() },
  { id: "p5", name: "Spaghetti Carbonara", description: "Creamy egg yolk sauce, crispy bacon, pecorino cheese", price: 180.00, category: "Mains", imageUrl: null, inStock: true, preparationStation: "kitchen", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() },
  { id: "p6", name: "Coca Cola", description: "Chilled 355ml glass bottle", price: 35.00, category: "Drinks", imageUrl: null, inStock: true, preparationStation: "bar", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() },
  { id: "p7", name: "Craft IPA Beer", description: "Local microbrew with citrus undertones", price: 85.00, category: "Drinks", imageUrl: null, inStock: true, preparationStation: "bar", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() },
  { id: "p8", name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten fudge core", price: 95.00, category: "Desserts", imageUrl: null, inStock: true, preparationStation: "cold_station", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() },
  { id: "p9", name: "NY Cheesecake", description: "Classic creamy cheesecake with strawberry glaze", price: 90.00, category: "Desserts", imageUrl: null, inStock: true, preparationStation: "cold_station", createdAt: createMockTimestamp(), updatedAt: createMockTimestamp() }
];

// Initial Mock Tables
const INITIAL_TABLES: Table[] = [
  { id: "t1", number: "1", capacity: 2, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() },
  { id: "t2", number: "2", capacity: 4, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() },
  { id: "t3", number: "3", capacity: 4, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() },
  { id: "t4", number: "4", capacity: 6, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() },
  { id: "t5", number: "5", capacity: 2, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() },
  { id: "t6", number: "6", capacity: 4, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() },
  { id: "t7", number: "7", capacity: 8, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() },
  { id: "t8", number: "8", capacity: 2, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() },
  { id: "t9", number: "Bar-1", capacity: 1, status: "free", currentOrderId: null, updatedAt: createMockTimestamp() }
];

export default function App() {
  // Global States
  const [isWaiterMode, setIsWaiterMode] = useState<boolean>(true); // View toggle
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Waiter Simulator specific states
  const [waiterStep, setWaiterStep] = useState<"tables" | "menu" | "table_status">("tables");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Appetizers");
  const [cart, setCart] = useState<{ product: Product; quantity: number; notes: string }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Owner Dashboard specific states
  const [ownerTab, setOwnerTab] = useState<"kds" | "metrics" | "menu" | "tables">("kds");

  // Keep Clock updated for simulated Android status bar
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Firebase Real-time integration sync (if configured)
  useEffect(() => {
    if (isFirebaseConfigured) {
      const restaurantId = "rest_mvp_demo"; // Default demo tenant ID
      const unsubscribe = subscribeToActiveOrders(
        restaurantId,
        (syncedOrders) => {
          setOrders(syncedOrders);
          // Sync table statuses based on received orders
          setTables(prevTables => {
            return prevTables.map(t => {
              const activeOrder = syncedOrders.find(o => o.tableId === t.id);
              if (activeOrder) {
                // If there's an active unpaid order, mark table as occupied/billing
                return {
                  ...t,
                  status: activeOrder.status === "ready" ? "billing" : "occupied",
                  currentOrderId: activeOrder.id || null
                };
              }
              return { ...t, status: "free", currentOrderId: null };
            });
          });
        },
        (error) => {
          console.error("Firebase live sync failed, continuing in mock mode:", error);
        }
      );
      return () => unsubscribe();
    }
  }, []);

  // Show visual floating messages
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // State Handler: waiter selects a table
  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    if (table.status === "occupied" || table.status === "billing") {
      setWaiterStep("table_status");
    } else {
      setCart([]);
      setWaiterStep("menu");
    }
  };

  // State Handler: add product to waiter cart
  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      triggerToast(`${product.name} is currently out of stock!`);
      return;
    }
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1, notes: "" }];
    });
    triggerToast(`Added ${product.name} to cart`);
  };

  // State Handler: adjust item quantity in cart
  const handleAdjustQty = (productId: string, amount: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number; notes: string }[];
    });
  };

  // State Handler: adjust notes for a cart item
  const handleUpdateItemNote = (productId: string, notes: string) => {
    setCart(prevCart => {
      return prevCart.map(item => 
        item.product.id === productId ? { ...item, notes } : item
      );
    });
  };

  // State Handler: submit order from cart
  const handleSendOrder = () => {
    if (cart.length === 0 || !selectedTable) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.16 * 100) / 100; // 16% Tax
    const serviceCharge = Math.round(subtotal * 0.10 * 100) / 100; // 10% tip
    const total = subtotal + tax + serviceCharge;

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id || "",
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      notes: item.notes,
      status: "pending",
      sentAt: createMockTimestamp()
    }));

    const nextOrderNumber = orders.length + 101;
    const newOrderId = `ord_${Math.random().toString(36).substr(2, 9)}`;

    const newOrder: Order = {
      id: newOrderId,
      tableId: selectedTable.id || "",
      tableName: selectedTable.number,
      orderNumber: nextOrderNumber,
      status: "pending",
      items: orderItems,
      subtotal,
      tax,
      serviceCharge,
      total,
      paymentMethod: null,
      createdBy: "Waiter-Jose",
      createdAt: createMockTimestamp(),
      updatedAt: createMockTimestamp(),
      closedAt: null
    };

    // If Firebase active, we would call doc addition:
    // await addDoc(collection(db, "restaurants", "rest_mvp_demo", "orders"), newOrder);
    // For visual simulation, we update the React local state directly:
    setOrders(prev => [newOrder, ...prev]);

    setTables(prev => prev.map(t => 
      t.id === selectedTable.id 
        ? { ...t, status: "occupied", currentOrderId: newOrderId } 
        : t
    ));

    // Reset simulator UI
    setCart([]);
    setShowCartDrawer(false);
    setWaiterStep("tables");
    setSelectedTable(null);
    triggerToast(`Order #${nextOrderNumber} sent to kitchen!`);
  };

  // State Handler: change table status from Waiter View (billing/dirty/etc.)
  const handleRequestBill = (table: Table) => {
    if (!table.currentOrderId) return;
    setOrders(prev => prev.map(o => o.id === table.currentOrderId ? { ...o, status: "ready" } : o));
    setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: "billing" } : t));
    setWaiterStep("tables");
    setSelectedTable(null);
    triggerToast(`Bill requested for Table ${table.number}`);
  };

  // State Handler: KDS ticket lifecycle advance (KDS actions)
  const handleAdvanceTicketStatus = (orderId: string, currentStatus: string) => {
    let nextStatus: "preparing" | "ready" | "served" | "paid" = "preparing";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "served";

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // Also update sub-items status to mirror core ticket
        const updatedItems = o.items.map(item => ({
          ...item,
          status: nextStatus === "ready" ? "ready" as const : (nextStatus === "preparing" ? "preparing" as const : item.status)
        }));
        return { ...o, status: nextStatus, items: updatedItems, updatedAt: createMockTimestamp() };
      }
      return o;
    }));

    // Update table color state based on progress
    if (nextStatus === "ready") {
      const orderObj = orders.find(o => o.id === orderId);
      if (orderObj) {
        setTables(prev => prev.map(t => t.id === orderObj.tableId ? { ...t, status: "billing" } : t));
      }
    }
    triggerToast(`Ticket status updated to: ${nextStatus}`);
  };

  // State Handler: Cashier finalizes billing (Clear Order & free Table)
  const handleFinalizeBill = (orderId: string, paymentMethod: "cash" | "card") => {
    const orderObj = orders.find(o => o.id === orderId);
    if (!orderObj) return;

    setOrders(prev => prev.filter(o => o.id !== orderId)); // Remove active (KDS) orders, simulate archiving
    setTables(prev => prev.map(t => 
      t.id === orderObj.tableId 
        ? { ...t, status: "free", currentOrderId: null } 
        : t
    ));
    triggerToast(`Table ${orderObj.tableName} payment completed via ${paymentMethod.toUpperCase()}. Table is now FREE.`);
  };

  // State Handler: Admin toggles menu stock
  const handleToggleProductStock = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, inStock: !p.inStock, updatedAt: createMockTimestamp() } : p
    ));
    triggerToast("Menu stock updated");
  };

  // Android Navigation Actions (Physical buttons simulation)
  const handleAndroidBack = () => {
    if (showCartDrawer) {
      setShowCartDrawer(false);
    } else if (waiterStep === "menu" || waiterStep === "table_status") {
      setWaiterStep("tables");
      setSelectedTable(null);
    }
  };

  // Owner statistics math
  const getMetrics = () => {
    const totalSales = orders.filter(o => o.status === "paid" || o.status === "ready" || o.status === "served")
                             .reduce((sum, o) => sum + o.total, 0);
    const pendingOrdersCount = orders.filter(o => o.status !== "paid" && o.status !== "cancelled").length;
    const occupiedTablesCount = tables.filter(t => t.status === "occupied" || t.status === "billing").length;
    const occupancyRate = Math.round((occupiedTablesCount / tables.length) * 100);
    const avgTicket = pendingOrdersCount > 0 ? Math.round((totalSales || 350) / pendingOrdersCount) : 0;

    return { totalSales, pendingOrdersCount, occupiedTablesCount, occupancyRate, avgTicket };
  };

  const metrics = getMetrics();

  return (
    <div className="simulator-container">
      {/* Simulation Master Header Control Panel */}
      <header className="simulator-header">
        <div className="logo-section">
          <h1>SaborPOS SaaS</h1>
          <p>Cloud Restaurant Management System</p>
        </div>

        <div className="mode-selectors">
          <button 
            className={`mode-btn ${isWaiterMode ? "active" : ""}`}
            onClick={() => setIsWaiterMode(true)}
          >
            <Smartphone size={16} />
            Waiter Mobile (Android)
          </button>
          <button 
            className={`mode-btn ${!isWaiterMode ? "active" : ""}`}
            onClick={() => {
              setIsWaiterMode(false);
              setOwnerTab("kds");
            }}
          >
            <Server size={16} />
            Owner Dashboard (Web)
          </button>
        </div>

        <div>
          {isFirebaseConfigured ? (
            <span className="indicator-badge cloud">
              <Check size={12} /> Live Firebase Cloud
            </span>
          ) : (
            <span className="indicator-badge mock">
              <AlertCircle size={12} /> Local Mock Database
            </span>
          )}
        </div>
      </header>

      {/* Simulator Workspace Area */}
      <main className="simulator-body">
        
        {/* ======================= WAITER MODE (ANDROID SMARTPHONE) ======================= */}
        {isWaiterMode && (
          <div className="android-wrapper">
            <div className="phone-frame">
              <div className="phone-screen">
                
                {/* Android OS Status Bar */}
                <div className="android-status-bar">
                  <span>{currentTime}</span>
                  <div className="status-icons">
                    <span style={{ fontSize: '0.65rem', marginRight: '4px' }}>LTE</span>
                    <span>📶</span>
                    <span>🔋 92%</span>
                  </div>
                </div>

                {/* Waiter App Header */}
                <div className="waiter-app-header">
                  <div className="waiter-app-info">
                    <div className="waiter-title">
                      <h2>Order Assistant</h2>
                      <p>Waiter Mode: Jose</p>
                    </div>
                    {waiterStep === "tables" && (
                      <span className="indicator-badge cloud" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                        Online
                      </span>
                    )}
                  </div>
                </div>

                {/* Android App Internal Viewport */}
                <div className="waiter-content-body">
                  
                  {/* STEP 1: TABLES GRID SELECTOR */}
                  {waiterStep === "tables" && (
                    <div>
                      <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Select a Table to Begin
                      </h3>
                      <div className="tables-grid-sim">
                        {tables.map(t => (
                          <div 
                            key={t.id} 
                            className={`table-node ${t.status}`}
                            onClick={() => handleSelectTable(t)}
                          >
                            <h3>Mesa {t.number}</h3>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cap: {t.capacity}</p>
                            <span>{t.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MENU CATALOG CATEGORIES */}
                  {waiterStep === "menu" && selectedTable && (
                    <div className="waiter-menu-flow">
                      <div className="menu-flow-header">
                        <button className="back-btn-sim" onClick={handleAndroidBack}>
                          <ChevronLeft size={20} />
                        </button>
                        <div>
                          <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Mesa {selectedTable.number}</h3>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Adding new round of items</p>
                        </div>
                      </div>

                      {/* Category Switcher Tabs */}
                      <div className="menu-category-tabs">
                        {["Appetizers", "Mains", "Drinks", "Desserts"].map(cat => (
                          <button
                            key={cat}
                            className={`category-tab-sim ${activeCategory === cat ? "active" : ""}`}
                            onClick={() => setActiveCategory(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Products feed */}
                      <div className="sim-products-list">
                        {products
                          .filter(p => p.category === activeCategory)
                          .map(product => (
                            <div key={product.id} className="sim-product-item">
                              <div className="sim-product-details">
                                <div>
                                  <h4>{product.name}</h4>
                                  <p>{product.description}</p>
                                </div>
                                <div className="sim-product-price-row">
                                  <span className="sim-product-price">${product.price.toFixed(2)}</span>
                                  {product.inStock ? (
                                    <button 
                                      className="sim-add-btn"
                                      onClick={() => handleAddToCart(product)}
                                    >
                                      + Add
                                    </button>
                                  ) : (
                                    <span style={{ color: 'var(--danger)', fontSize: '0.65rem', fontWeight: 600 }}>
                                      Sold Out
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Floating Action Cart Trigger */}
                      {cart.length > 0 && (
                        <button 
                          className="sim-cart-floating-btn"
                          onClick={() => setShowCartDrawer(true)}
                        >
                          <ShoppingBag size={20} />
                          <span className="cart-count-sim">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* STEP 3: ACTIVE TABLE STATUS DETAILS */}
                  {waiterStep === "table_status" && selectedTable && (
                    <div>
                      <div className="menu-flow-header" style={{ marginBottom: '16px' }}>
                        <button className="back-btn-sim" onClick={handleAndroidBack}>
                          <ChevronLeft size={20} />
                        </button>
                        <div>
                          <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Mesa {selectedTable.number} Details</h3>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Current session status</p>
                        </div>
                      </div>

                      {/* Display current active order info */}
                      {(() => {
                        const tableOrder = orders.find(o => o.id === selectedTable.currentOrderId);
                        if (!tableOrder) {
                          return (
                            <div className="text-center" style={{ padding: '24px' }}>
                              <p style={{ color: 'var(--text-muted)' }}>No active order found. Reverting...</p>
                              <button 
                                className="sim-checkout-btn" 
                                style={{ marginTop: '12px' }}
                                onClick={() => setWaiterStep("tables")}
                              >
                                Go Back
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Order ID</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>#{tableOrder.orderNumber}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Status</span>
                                <span className={`indicator-badge ${tableOrder.status === "ready" ? "cloud" : "mock"}`} style={{ padding: '2px 8px', fontSize: '0.6rem' }}>
                                  {tableOrder.status}
                                </span>
                              </div>
                            </div>

                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Ordered Items</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                              {tableOrder.items.map((item, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.quantity}x {item.name}</p>
                                    {item.notes && <p style={{ fontSize: '0.65rem', color: 'var(--warning)' }}>* {item.notes}</p>}
                                  </div>
                                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                                    {item.status}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Total:</span>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--success)' }}>${tableOrder.total.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                              <button 
                                className="sim-checkout-btn" 
                                style={{ background: 'var(--primary)', flex: 1 }}
                                onClick={() => setWaiterStep("menu")}
                              >
                                + Add Items
                              </button>
                              {selectedTable.status === "occupied" && (
                                <button 
                                  className="sim-checkout-btn" 
                                  style={{ background: 'var(--warning)', flex: 1 }}
                                  onClick={() => handleRequestBill(selectedTable)}
                                >
                                  Request Bill
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* BOTTOM CART DRAWER DRAWER */}
                  {showCartDrawer && (
                    <div className="waiter-cart-panel">
                      <div className="cart-panel-header">
                        <h3>Mesa {selectedTable?.number} Cart</h3>
                        <button className="back-btn-sim" onClick={() => setShowCartDrawer(false)}>
                          <X size={18} />
                        </button>
                      </div>

                      <div className="sim-cart-list">
                        {cart.map(item => (
                          <div key={item.product.id} className="sim-cart-item">
                            <div className="sim-cart-item-info">
                              <span className="sim-cart-item-name">{item.product.name}</span>
                              <div className="sim-cart-qty-control">
                                <button className="sim-qty-btn" onClick={() => handleAdjustQty(item.product.id || "", -1)}>
                                  -
                                </button>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.quantity}</span>
                                <button className="sim-qty-btn" onClick={() => handleAdjustQty(item.product.id || "", 1)}>
                                  +
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              className="sim-item-notes-input"
                              placeholder="Special instructions (no onions, extra spicy...)"
                              value={item.notes}
                              onChange={(e) => handleUpdateItemNote(item.product.id || "", e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="sim-cart-summary">
                        <div className="sim-summary-row">
                          <span>Subtotal</span>
                          <span>${cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        <div className="sim-summary-row">
                          <span>Est. Tax (16% VAT)</span>
                          <span>${(cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.16).toFixed(2)}</span>
                        </div>
                        <div className="sim-summary-row.total">
                          <div className="sim-summary-row total">
                            <span>Est. Total</span>
                            <span>${(cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 1.26).toFixed(2)}</span>
                          </div>
                        </div>
                        <button className="sim-checkout-btn" onClick={handleSendOrder}>
                          Send to Kitchen 🍳
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Simulated Android Hardware Navigation Bar */}
                <div className="android-nav-bar">
                  <button className="back-btn-sim" onClick={handleAndroidBack}>
                    <div className="nav-shape triangle"></div>
                  </button>
                  <button className="back-btn-sim" onClick={() => {
                    setWaiterStep("tables");
                    setSelectedTable(null);
                    setShowCartDrawer(false);
                  }}>
                    <div className="nav-shape circle"></div>
                  </button>
                  <button className="back-btn-sim" onClick={() => triggerToast("Mock Recents button triggered")}>
                    <div className="nav-shape square"></div>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ======================= OWNER WEB VIEW (DESKTOP DASHBOARD) ======================= */}
        {!isWaiterMode && (
          <div className="owner-dashboard">
            
            {/* Sidebar */}
            <aside className="owner-sidebar">
              <div>
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Management
                </h3>
                <nav className="sidebar-menu">
                  <button 
                    className={`sidebar-btn ${ownerTab === "kds" ? "active" : ""}`}
                    onClick={() => setOwnerTab("kds")}
                  >
                    🍳 Kitchen (KDS)
                  </button>
                  <button 
                    className={`sidebar-btn ${ownerTab === "metrics" ? "active" : ""}`}
                    onClick={() => setOwnerTab("metrics")}
                  >
                    📊 Metrics & Stats
                  </button>
                  <button 
                    className={`sidebar-btn ${ownerTab === "menu" ? "active" : ""}`}
                    onClick={() => setOwnerTab("menu")}
                  >
                    📋 Menu Catalog
                  </button>
                  <button 
                    className={`sidebar-btn ${ownerTab === "tables" ? "active" : ""}`}
                    onClick={() => setOwnerTab("tables")}
                  >
                    🪑 Table Map
                  </button>
                </nav>
              </div>

              <div className="sidebar-footer">
                <p>Owner Mode: Admin</p>
                <p style={{ fontSize: '0.65rem', marginTop: '4px' }}>Tenant: rest_mvp_demo</p>
              </div>
            </aside>

            {/* Dashboard main panel */}
            <section className="owner-panel-content">
              
              {/* TAB 1: KITCHEN DISPLAY TICKETS (KDS) */}
              {ownerTab === "kds" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="panel-header-row">
                    <div>
                      <h2>Kitchen Display System (KDS)</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Live tracking of kitchen orders</p>
                    </div>
                    <span className="indicator-badge cloud">
                      {orders.length} active tickets
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="glass-panel text-center" style={{ padding: '60px', borderRadius: '12px' }}>
                      <p style={{ color: 'var(--text-muted)' }}>No pending or cooking orders.</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: '6px' }}>
                        (Use the Waiter Mobile view to place simulated orders)
                      </p>
                    </div>
                  ) : (
                    <div className="kds-tickets-grid">
                      {orders.map(order => (
                        <div key={order.id} className={`kds-ticket ${order.status}`}>
                          <div className="kds-ticket-header">
                            <h4>Mesa {order.tableName}</h4>
                            <span className={`ticket-status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="kds-ticket-body">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="kds-ticket-item">
                                <div>
                                  <span className="kds-item-qty">{item.quantity}x</span>
                                  <span className="kds-item-name">{item.name}</span>
                                  {item.notes && <span className="kds-item-notes">{item.notes}</span>}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="kds-ticket-footer">
                            <span className="kds-ticket-time">
                              Ticket #{order.orderNumber}
                            </span>
                            <span className="kds-ticket-total">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>

                          {order.status !== "ready" && order.status !== "served" ? (
                            <button 
                              className="kds-action-btn"
                              onClick={() => handleAdvanceTicketStatus(order.id || "", order.status)}
                            >
                              {order.status === "pending" ? "Start Preparing 🍳" : "Mark Ready & Call Waiter 🛎️"}
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <button 
                                className="kds-action-btn" 
                                style={{ background: '#1e3a8a', width: '50%' }}
                                onClick={() => handleFinalizeBill(order.id || "", "cash")}
                              >
                                Cash Payment 💵
                              </button>
                              <button 
                                className="kds-action-btn" 
                                style={{ background: '#0f766e', width: '50%' }}
                                onClick={() => handleFinalizeBill(order.id || "", "card")}
                              >
                                Card Payment 💳
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: METRICS & INCOME TRACKER */}
              {ownerTab === "metrics" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="panel-header-row">
                    <div>
                      <h2>Operational Metrics</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Financial and table metrics for today</p>
                    </div>
                  </div>

                  <div className="stats-metrics-row">
                    <div className="metric-card">
                      <div className="metric-card-details">
                        <h4>Total Active Revenue</h4>
                        <p>${metrics.totalSales.toFixed(2)}</p>
                      </div>
                      <div className="metric-icon-box sales">
                        <DollarSign size={20} />
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-card-details">
                        <h4>Active Tickets</h4>
                        <p>{metrics.pendingOrdersCount}</p>
                      </div>
                      <div className="metric-icon-box orders">
                        <TrendingUp size={20} />
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-card-details">
                        <h4>Table Occupancy</h4>
                        <p>{metrics.occupancyRate}%</p>
                      </div>
                      <div className="metric-icon-box tables">
                        <Utensils size={20} />
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-card-details">
                        <h4>Avg Ticket Value</h4>
                        <p>${metrics.avgTicket}</p>
                      </div>
                      <div className="metric-icon-box avg">
                        <Layers size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Live Table Roster Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tables.map(t => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <span>Table {t.number} (Cap: {t.capacity})</span>
                          <span style={{ fontWeight: 600 }} className={t.status === "free" ? "text-success" : "text-warning"}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MENU STOCK MANAGER */}
              {ownerTab === "menu" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="panel-header-row">
                    <div>
                      <h2>Product Catalog & Stock</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Toggle item availability instantly</p>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <table className="products-manager-table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Prep Station</th>
                          <th>Stock Status</th>
                          <th>Toggle Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>{p.name}</td>
                            <td>{p.category}</td>
                            <td>${p.price.toFixed(2)}</td>
                            <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{p.preparationStation}</code></td>
                            <td>
                              <span className={`ticket-status-badge ${p.inStock ? "ready" : "pending"}`}>
                                {p.inStock ? "Available" : "Sold Out"}
                              </span>
                            </td>
                            <td>
                              <button 
                                className={`stock-toggle-btn ${p.inStock ? "in-stock" : "out-stock"}`}
                                onClick={() => handleToggleProductStock(p.id || "")}
                              >
                                {p.inStock ? "Disable" : "Enable"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TABLE LAYOUT VISUALIZER */}
              {ownerTab === "tables" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="panel-header-row">
                    <div>
                      <h2>Restaurant Floor Map</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Visual representation of dining area tables</p>
                    </div>
                  </div>

                  <div className="tables-map-grid">
                    {tables.map(t => (
                      <div key={t.id} className="table-map-node">
                        <h3>Mesa {t.number}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Capacity: {t.capacity}</p>
                        <span className={`indicator-badge ${t.status === "free" ? "cloud" : (t.status === "billing" ? "cloud" : "mock")}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                          {t.status}
                        </span>
                        {t.currentOrderId && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary-light)' }}>
                            Active Bill
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </section>
          </div>
        )}

      </main>

      {/* Floating Application Live Toasts */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(18, 22, 31, 0.9)',
          border: '1px solid var(--primary)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💡 {toastMessage}
        </div>
      )}
    </div>
  );
}
