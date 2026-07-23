// ─── Existing operational types ──────────────────────────────────────────────

export type TableStatus = "disponible" | "ocupada" | "por_pagar";

export type MenuCategory = "alimentos" | "bebidas" | "postres";

export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  available: boolean;
  image?: string;
}

export interface OrderLine {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  order: OrderLine[];
  openedAt?: string;
}

export interface RestaurantConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  tableCount: number;
  taxRate: number;
}

export interface DailyReport {
  totalSales: number;
  ordersToday: number;
  averageTicket: number;
  topDishes: { name: string; quantity: number; revenue: number }[];
  salesByHour: { hour: string; amount: number }[];
}

export interface PartnerUser {
  name: string;
  email: string;
  restaurantName: string;
}

// ─── Firestore document types ─────────────────────────────────────────────────

/** Status lifecycle of a comanda/order */
export type OrderStatus = "pendiente" | "cocinando" | "entregado" | "por_pagar" | "pagado";

/** One line item inside a GlobalOrder */
export interface OrderItem {
  platilloId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
}

/**
 * `orders_global/{orderId}`
 * Central order document readable by POS web and future mobile apps.
 */
export interface GlobalOrder {
  id: string;
  restaurantId: string;
  mesaNumero: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  poolStaff: string; // uid of the waiter who took the order
  paymentMethod?: PaymentMethod;
}

/**
 * `sales_history/{saleId}`
 * Immutable record written when an order is marked 'pagado'.
 */
export interface SaleRecord {
  id: string;
  restaurantId: string;
  mesaNumero: number;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  closedAt: string;
  poolStaff: string;
}

/**
 * `restaurants/{restaurantId}`
 * Top-level restaurant document.
 */
export interface RestaurantDoc {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  tableCount: number;
  taxRate: number;
  duenoUid: string;
  createdAt: string;
}
