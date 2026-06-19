import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.json');

// Default initial state
const defaultState = {
  products: [
    { id: 'torta-frutos', name: 'Torta de Frutos Rojos', description: 'Bizcocho de vainilla, crema diplomática y una selección de los mejores frutos rojos de temporada.', price: 45000, image_url: 'https://media.elgourmet.com/recetas/cover_2olanrw9ec_frutosrojos.jpg', category: 'Torta', is_featured: 1 },
    { id: 'croissants', name: 'Croissants Franceses', description: 'Docena de croissants de mantequilla pura, laminados a mano con precisión.', price: 28000, image_url: 'https://sabor.eluniverso.com/wp-content/uploads/2024/01/shutterstock_642373528-scaled.jpg', category: 'Bollería', is_featured: 0 },
    { id: 'cupcakes', name: 'Caja de Cupcakes', description: 'Surtido de 6 unidades con decoraciones personalizadas y sabores premium.', price: 22000, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTydrIVhQkMPrv6Lxy-El9ZlxfLLTIdT6Ltng&s', category: 'Cupcakes', is_featured: 0 },
    { id: 'chocolate-premium', name: 'Torta de Chocolate Premium', description: 'Intenso bizcocho de chocolate con ganache de chocolate belga.', price: 38000, image_url: 'https://velvetbakery.cl/cdn/shop/products/TrozoChocolateCS.jpg?v=1666196913&width=990', category: 'Torta', is_featured: 1 },
    { id: 'selva-negra', name: 'Torta Selva Negra', description: 'Bizcocho de chocolate, crema chantilly, cerezas al marrasquino.', price: 35000, image_url: 'https://media.falabella.com/tottusCL/21346128_1/w=1004,h=1500,fit=pad', category: 'Torta', is_featured: 0 },
    { id: 'tres-leches', name: 'Torta Tres Leches', description: 'Clásico bizcocho bañado en tres tipos de leche con merengue suizo.', price: 32000, image_url: 'https://sweetbrownie.cl/wp-content/uploads/2025/10/torta-tres-leches-para-25-personas.webp', category: 'Torta', is_featured: 1 },
    { id: 'mil-hojas-manjar', name: 'Mil Hojas de Manjar', description: 'Capas crujientes de hoja con abundante manjar blanco.', price: 36000, image_url: 'https://lafloresta.cl/wp-content/uploads/2024/07/20210723_160600-scaled-1.jpg', category: 'Torta', is_featured: 0 },
    { id: 'mil-hojas-frambuesa', name: 'Mil Hojas de Frambuesa', description: 'Capas de hoja con manjar y coulis de frambuesa natural.', price: 38000, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5kMmem1L2c53Mw38lL_naJFI6L18_HHiTYw&s', category: 'Torta', is_featured: 0 },
    { id: 'torta-oreo', name: 'Torta de Oreo', description: 'Bizcocho de chocolate con crema de oreo y trozos de galleta.', price: 34000, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNaPBVAZlPl2Y5mvYpOrKQqnDuf_TSQfE0jQ&s', category: 'Torta', is_featured: 0 },
    { id: 'torta-matrimonial', name: 'Torta Matrimonial', description: 'Elegante torta de novios con decoración personalizada y flores naturales.', price: 150000, image_url: 'https://www.brides.com/thmb/T6vlFOgbrCowU4Ab5AGQXUm7nFM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ChadWuPhotographysweetheatheranne-ce590b554dad466589fc28b41a122e8d.jpg', category: 'Torta', is_featured: 1 }
  ],
  supplies: [
    { id: 1, name: 'Harina Sin Polvos', quantity: 2.5, unit: 'kg', category: 'Ingredientes Base', status: 'Por Agotarse', min_threshold: 10.0, supplier: 'Molino San Cristóbal' },
    { id: 2, name: 'Mantequilla Sin Sal', quantity: 0.5, unit: 'kg', category: 'Ingredientes Base', status: 'Por Agotarse', min_threshold: 5.0, supplier: 'Lácteos del Sur' },
    { id: 3, name: 'Chocolate Semi-Amargo', quantity: 0.0, unit: 'kg', category: 'Ingredientes Base', status: 'Por Agotarse', min_threshold: 2.0, supplier: 'Cacao Real' },
    { id: 4, name: 'Azúcar Granulada', quantity: 25.0, unit: 'kg', category: 'Ingredientes Base', status: 'Suficiente', min_threshold: 10.0, supplier: 'Distribuidora Dulce' },
    { id: 5, name: 'Cajas de Cartón 20x20', quantity: 15.0, unit: 'unid.', category: 'Empaque', status: 'Por Agotarse', min_threshold: 30.0, supplier: 'Cajas Envases S.A.' },
    { id: 6, name: 'Sal Fina', quantity: 2.0, unit: 'kg', category: 'Ingredientes Base', status: 'En Pedido', min_threshold: 1.0, supplier: 'Molino San Cristóbal' },
    { id: 7, name: 'Cinta de Embalaje', quantity: 5.0, unit: 'rollos', category: 'Suministros Generales', status: 'Suficiente', min_threshold: 2.0, supplier: 'Suministros Central' }
  ],
  kitchen_config: [
    { key: 'kitchen_name', value: 'Dulce Descontrol Central' },
    { key: 'kitchen_email', value: 'dulce.descontrol01@gmail.com' },
    { key: 'prep_lead_time', value: '48' },
    { key: 'schedule_monday_active', value: 'true' },
    { key: 'schedule_monday_start', value: '06:00' },
    { key: 'schedule_monday_end', value: '16:00' },
    { key: 'schedule_tuesday_active', value: 'true' },
    { key: 'schedule_tuesday_start', value: '06:00' },
    { key: 'schedule_tuesday_end', value: '16:00' },
    { key: 'admin_pin', value: '123456' }
  ],
  orders: [] as any[],
  order_items: [] as any[],
  custom_specifications: [] as any[]
};


let data = { ...defaultState };

function getInitialOrders() {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const pastDate = new Date();
  pastDate.setDate(tomorrow.getDate() - 5);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  return [
    { id: '#089', client_name: 'María González', client_phone: '+56 9 8765 4321', client_email: 'maria@gmail.com', client_address: 'Retiro en Taller', delivery_date: todayStr, delivery_time: '14:00', payment_method: 'transferencia', status: 'En producción', notes: '', total_price: 1450000, type: 'custom', created_at: todayStr },
    { id: '#092', client_name: 'Cafetería El Grano', client_phone: '+56 2 2234 5678', client_email: 'contacto@elgrano.cl', client_address: 'Retiro en Taller', delivery_date: tomorrowStr, delivery_time: '07:00', payment_method: 'transferencia', status: 'Confirmado', notes: 'Retiro temprano.', total_price: 850000, type: 'standard', created_at: todayStr },
    { id: '#085', client_name: 'Carlos Ruiz', client_phone: '+56 9 1111 2222', client_email: 'carlos@ruiz.cl', client_address: 'Retiro en Taller', delivery_date: todayStr, delivery_time: '10:00', payment_method: 'efectivo', status: 'Entregado', notes: '', total_price: 320000, type: 'standard', created_at: pastDateStr },
    { id: '#095', client_name: 'Valentina Tapia', client_phone: '+56 9 9999 8888', client_email: 'valita@tapia.cl', client_address: 'Retiro en Taller', delivery_date: tomorrowStr, delivery_time: '18:00', payment_method: 'transferencia', status: 'Cotizado', notes: 'Escribir "Feliz Cumple Vale"', total_price: 2100000, type: 'custom', created_at: todayStr }
  ];
}

function getInitialSpecs() {
  return [
    { id: 1, order_id: '#089', shape: 'Múltiples Pisos', cake_base: 'Vainilla Bourbon', filling: 'Ganache de Chocolate Blanco y Frambuesa', frosting: 'Buttercream Suizo', portions: 50, event_type: 'Matrimonio', description: 'Pastel rústico con flores naturales blancas y toque dorado.' },
    { id: 2, order_id: '#095', shape: 'Redonda Clásica', cake_base: 'Chocolate Cacao Intenso', filling: 'Manjar Blanco', frosting: 'Fondant Liso', portions: 30, event_type: 'Cumpleaños', description: 'Diseño temático elegante en tonos pasteles.' }
  ];
}

function getInitialItems() {
  return [
    { id: 1, order_id: '#089', product_name: 'Pastel de Bodas 3 Pisos', quantity: 1, price: 1400000 },
    { id: 2, order_id: '#089', product_name: 'Macarons Surtidos', quantity: 48, price: 50000 },
    { id: 3, order_id: '#092', product_name: 'Croissants', quantity: 24, price: 400000 },
    { id: 4, order_id: '#092', product_name: 'Pan de Masa Madre', quantity: 12, price: 300000 },
    { id: 5, order_id: '#092', product_name: 'Galletas de Chispas', quantity: 30, price: 150000 },
    { id: 6, order_id: '#085', product_name: 'Tarta de Manzana Clásica', quantity: 1, price: 320000 },
    { id: 7, order_id: '#095', product_name: 'Torta de Bodas Personalizada', quantity: 1, price: 2100000 }
  ];
}

export async function initDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const rawData = fs.readFileSync(DB_PATH, 'utf-8');
      data = JSON.parse(rawData);
    } catch (e) {
      console.error("Error reading db file, regenerating defaults", e);
      restoreDefaults();
    }
  } else {
    restoreDefaults();
  }
}

function restoreDefaults() {
  data.products = [...defaultState.products];
  data.supplies = [...defaultState.supplies];
  data.kitchen_config = [...defaultState.kitchen_config];
  data.orders = getInitialOrders();
  data.custom_specifications = getInitialSpecs();
  data.order_items = getInitialItems();
  saveDb();
}

function saveDb() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ==========================================
// API Operations
// ==========================================

export async function getProducts() {
  return data.products.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl || p.image_url,
    category: p.category,
    isFeatured: p.isFeatured !== undefined ? p.isFeatured : p.is_featured
  }));
}

export async function getStats() {
  const activeOrders = data.orders.filter(o => ['Confirmado', 'En producción', 'Entregado'].includes(o.status));
  const monthlyRevenue = activeOrders.reduce((sum, o) => sum + (o.totalPrice !== undefined ? o.totalPrice : (o.total_price || 0)), 0) || 4500000;

  const todayStr = new Date().toISOString().split('T')[0];
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const dailyOrders = activeOrders.filter(o => {
    const d = o.created_at || o.createdAt;
    return d && d.startsWith(todayStr);
  });
  
  const weeklyOrders = activeOrders.filter(o => {
    const d = o.created_at || o.createdAt;
    return d && new Date(d) >= lastWeek;
  });

  const dailyRevenue = dailyOrders.reduce((sum, o) => sum + (o.totalPrice !== undefined ? o.totalPrice : (o.total_price || 0)), 0);
  const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + (o.totalPrice !== undefined ? o.totalPrice : (o.total_price || 0)), 0);

  const urgentInProduction = data.orders.filter(o => o.status === 'En producción').length;
  const pendingConfirmed = data.orders.filter(o => o.status === 'Confirmado').length;
  const completed = data.orders.filter(o => o.status === 'Entregado').length;
  const lowStockCount = data.supplies.filter(s => s.status === 'Por Agotarse').length;
  const activeProductionTasks = urgentInProduction;

  return {
    monthlyRevenue,
    dailyRevenue,
    weeklyRevenue,
    targetPercent: 85,
    monthlyGrowthPercent: 12,
    ordersCount: {
      urgentInProduction,
      pendingConfirmed,
      completed,
      activeProductionTasks
    },
    lowStockCount
  };
}

export async function checkAdminPin(pin: string) {
  const pinConf = data.kitchen_config.find(c => c.key === 'admin_pin');
  const storedPin = pinConf ? pinConf.value : '123456';
  return pin === storedPin;
}

function mapOrder(order: any) {
  const orderItems = data.order_items.filter((i: any) => i.order_id === order.id || i.orderId === order.id).map(i => ({
    id: i.id,
    orderId: i.orderId || i.order_id,
    productName: i.productName || i.product_name,
    quantity: i.quantity,
    price: i.price
  }));

  let customSpecs = null;
  const rawSpecs = data.custom_specifications.find((s: any) => s.order_id === order.id || s.orderId === order.id);
  if (order.type === 'custom' && rawSpecs) {
    customSpecs = {
      id: rawSpecs.id,
      orderId: rawSpecs.orderId || rawSpecs.order_id,
      shape: rawSpecs.shape,
      cakeBase: rawSpecs.cakeBase || rawSpecs.cake_base,
      filling: rawSpecs.filling,
      frosting: rawSpecs.frosting,
      portions: rawSpecs.portions,
      eventType: rawSpecs.eventType || rawSpecs.event_type,
      description: rawSpecs.description
    };
  }

  return {
    id: order.id,
    clientName: order.clientName || order.client_name,
    clientPhone: order.clientPhone || order.client_phone,
    clientEmail: order.clientEmail || order.client_email,
    clientAddress: order.clientAddress || order.client_address,
    deliveryDate: order.deliveryDate || order.delivery_date,
    deliveryTime: order.deliveryTime || order.delivery_time,
    paymentMethod: order.paymentMethod || order.payment_method,
    status: order.status,
    notes: order.notes,
    totalPrice: order.totalPrice !== undefined ? order.totalPrice : order.total_price,
    type: order.type,
    createdAt: order.createdAt || order.created_at,
    items: orderItems,
    customSpecs
  };
}

export async function getOrders() {
  // Return sorted by created_at desc
  const sorted = [...data.orders].sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime());
  
  return sorted.map(mapOrder);
}

export async function getOrderById(rawId: string) {
  const cleanId = rawId.startsWith('#') ? rawId : `#${rawId}`;
  const order = data.orders.find(o => o.id === rawId || o.id === cleanId);
  if (!order) return null;

  return mapOrder(order);
}

export async function createOrder(payload: any) {
  const randomNum = Math.floor(100 + Math.random() * 900);
  const orderId = `#DD-2026-${randomNum}`;
  const createdAtStr = new Date().toISOString();

  const newOrder = {
    id: orderId,
    client_name: payload.clientName,
    client_phone: payload.clientPhone,
    client_email: payload.clientEmail || '',
    client_address: payload.clientAddress || 'Retiro en Taller',
    delivery_date: payload.deliveryDate,
    delivery_time: payload.deliveryTime || '12:00',
    payment_method: payload.paymentMethod,
    status: 'Cotizado',
    notes: payload.notes || '',
    total_price: payload.totalPrice || 0,
    type: payload.type,
    created_at: createdAtStr
  };
  data.orders.push(newOrder);

  if (payload.items && Array.isArray(payload.items)) {
    payload.items.forEach(item => {
      data.order_items.push({
        id: Math.max(0, ...data.order_items.map(i => i.id)) + 1,
        order_id: orderId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price
      });
    });
  }

  if (payload.type === 'custom' && payload.customSpecs) {
    data.custom_specifications.push({
      id: Math.max(0, ...data.custom_specifications.map(i => i.id)) + 1,
      order_id: orderId,
      shape: payload.customSpecs.shape || '',
      cake_base: payload.customSpecs.cakeBase || '',
      filling: payload.customSpecs.filling || '',
      frosting: payload.customSpecs.frosting || '',
      portions: payload.customSpecs.portions || 10,
      event_type: payload.customSpecs.eventType || 'Otro',
      description: payload.customSpecs.description || ''
    });
  }

  saveDb();
  return await getOrderById(orderId);
}

export async function updateOrderStatus(id: string, status: string) {
  const order = data.orders.find(o => o.id === id);
  if (!order) return false;
  order.status = status;
  saveDb();
  return true;
}

export async function getSupplies() {
  return data.supplies.map((s: any) => ({
    id: s.id,
    name: s.name,
    quantity: s.quantity,
    unit: s.unit,
    category: s.category,
    status: s.status,
    minThreshold: s.minThreshold !== undefined ? s.minThreshold : s.min_threshold,
    supplier: s.supplier
  }));
}

export async function updateSupply(id: string, payload: any) {
  const supply = data.supplies.find((s: any) => s.id === parseInt(id) || String(s.id) === id);
  if (!supply) return null;

  const finalQuantity = payload.quantity !== undefined ? parseFloat(payload.quantity) : supply.quantity;
  const finalMinThresh = (supply as any).minThreshold !== undefined ? (supply as any).minThreshold : supply.min_threshold;
  
  let finalStatus = 'Suficiente';
  if (supply.status === 'En Pedido' && payload.quantity === supply.quantity) {
    finalStatus = 'En Pedido';
  } else if (finalQuantity <= 0) {
    finalStatus = 'Por Agotarse';
  } else if (finalQuantity < finalMinThresh) {
    finalStatus = 'Por Agotarse';
  }

  supply.quantity = finalQuantity;
  supply.status = finalStatus;
  if (payload.supplier) supply.supplier = payload.supplier;
  if (payload.name) supply.name = payload.name;

  saveDb();
  return {
    id: supply.id,
    name: supply.name,
    quantity: supply.quantity,
    unit: supply.unit,
    category: supply.category,
    status: supply.status,
    minThreshold: finalMinThresh,
    supplier: supply.supplier
  };
}

export async function purchaseAllLowSupplies() {
  data.supplies.forEach((s: any) => {
    if (s.status === 'Por Agotarse') {
      s.status = 'En Pedido';
    }
  });
  saveDb();
  return getSupplies();
}

export async function getConfig() {
  const configObj: Record<string, string> = {};
  data.kitchen_config.forEach((c: any) => {
    configObj[c.key] = c.value;
  });
  return configObj;
}

export async function updateConfig(updates: Record<string, string>) {
  for (const [key, value] of Object.entries(updates)) {
    const c = data.kitchen_config.find(c => c.key === key);
    if (c) {
      c.value = String(value);
    } else {
      data.kitchen_config.push({ key, value: String(value) });
    }
  }
  saveDb();
  return true;
}
