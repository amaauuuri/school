import type { DailyReport, MenuItem, RestaurantConfig, Table } from "./types";

export const INITIAL_MENU: MenuItem[] = [
  {
    id: "m1",
    name: "Tacos al Pastor",
    description: "Orden de 3 tacos con piña, cilantro y cebolla",
    price: 89,
    category: "alimentos",
    available: true,
  },
  {
    id: "m2",
    name: "Enchiladas Suizas",
    description: "Pollo en salsa verde con crema y queso gratinado",
    price: 145,
    category: "alimentos",
    available: true,
  },
  {
    id: "m3",
    name: "Ensalada César",
    description: "Lechuga romana, crutones, parmesano y aderezo casero",
    price: 110,
    category: "alimentos",
    available: true,
  },
  {
    id: "m4",
    name: "Agua de Horchata",
    description: "500 ml, preparada del día",
    price: 35,
    category: "bebidas",
    available: true,
  },
  {
    id: "m5",
    name: "Cerveza Artesanal",
    description: "355 ml, selección del mes",
    price: 65,
    category: "bebidas",
    available: true,
  },
  {
    id: "m6",
    name: "Café Americano",
    description: "Grano 100% arábica",
    price: 40,
    category: "bebidas",
    available: true,
  },
  {
    id: "m7",
    name: "Flan Napolitano",
    description: "Con caramelo y crema batida",
    price: 55,
    category: "postres",
    available: true,
  },
  {
    id: "m8",
    name: "Churros con Chocolate",
    description: "4 piezas con salsa de chocolate belga",
    price: 70,
    category: "postres",
    available: true,
  },
];

export const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  number: i + 1,
  capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
  status: i === 2 ? "ocupada" : i === 5 ? "por_pagar" : "disponible",
  order:
    i === 2
      ? [
          {
            id: "o1",
            menuItemId: "m1",
            name: "Tacos al Pastor",
            price: 89,
            quantity: 2,
          },
          {
            id: "o2",
            menuItemId: "m4",
            name: "Agua de Horchata",
            price: 35,
            quantity: 2,
          },
        ]
      : i === 5
        ? [
            {
              id: "o3",
              menuItemId: "m2",
              name: "Enchiladas Suizas",
              price: 145,
              quantity: 1,
            },
            {
              id: "o4",
              menuItemId: "m7",
              name: "Flan Napolitano",
              price: 55,
              quantity: 2,
            },
          ]
        : [],
  openedAt: i === 2 || i === 5 ? new Date().toISOString() : undefined,
}));

export const INITIAL_CONFIG: RestaurantConfig = {
  name: "La Cocina de María",
  address: "Av. Reforma 123, Col. Centro, CDMX",
  phone: "+52 55 1234 5678",
  email: "contacto@lacocinademaria.mx",
  tableCount: 12,
  taxRate: 0.16,
};

export const MOCK_REPORT: DailyReport = {
  totalSales: 18450,
  ordersToday: 47,
  averageTicket: 392.55,
  topDishes: [
    { name: "Tacos al Pastor", quantity: 38, revenue: 3382 },
    { name: "Enchiladas Suizas", quantity: 22, revenue: 3190 },
    { name: "Cerveza Artesanal", quantity: 31, revenue: 2015 },
    { name: "Flan Napolitano", quantity: 19, revenue: 1045 },
    { name: "Agua de Horchata", quantity: 28, revenue: 980 },
  ],
  salesByHour: [
    { hour: "10:00", amount: 890 },
    { hour: "11:00", amount: 1240 },
    { hour: "12:00", amount: 2100 },
    { hour: "13:00", amount: 2850 },
    { hour: "14:00", amount: 3200 },
    { hour: "15:00", amount: 1980 },
    { hour: "16:00", amount: 1450 },
    { hour: "17:00", amount: 1680 },
    { hour: "18:00", amount: 2340 },
    { hour: "19:00", amount: 2720 },
  ],
};

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 499,
    period: "mes",
    description: "Ideal para cafeterías y food trucks",
    features: [
      "Hasta 8 mesas",
      "1 usuario operativo",
      "Menú básico",
      "Reportes diarios",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 899,
    period: "mes",
    description: "El favorito de restaurantes en crecimiento",
    features: [
      "Hasta 25 mesas",
      "5 usuarios operativos",
      "Menú ilimitado",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 1499,
    period: "mes",
    description: "Para cadenas y grupos gastronómicos",
    features: [
      "Mesas ilimitadas",
      "Usuarios ilimitados",
      "Multi-sucursal",
      "API e integraciones",
      "Gerente de cuenta dedicado",
    ],
    highlighted: false,
  },
];
