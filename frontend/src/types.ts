export type OrderStatus = 'Cotizado' | 'Confirmado' | 'En producción' | 'Entregado' | 'Cancelado';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
}

export interface OrderItem {
  id?: number;
  orderId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CustomSpecification {
  id?: number;
  orderId: string;
  shape?: string;
  cakeBase?: string;
  filling?: string;
  frosting?: string;
  portions?: number;
  eventType?: string;
  description?: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  deliveryDate: string;
  deliveryTime?: string;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
  status: OrderStatus;
  notes?: string;
  totalPrice: number;
  type: 'custom' | 'standard';
  createdAt: string;
  items?: OrderItem[];
  customSpecs?: CustomSpecification;
}

export interface Supply {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  status: 'Suficiente' | 'Por Agotarse' | 'En Pedido';
  minThreshold: number;
  supplier: string;
}

export interface KitchenConfig {
  key: string;
  value: string;
}

export interface SystemStats {
  monthlyRevenue: number;
  targetPercent: number;
  monthlyGrowthPercent: number;
  ordersCount: {
    urgentInProduction: number;
    pendingConfirmed: number;
    completed: number;
  };
}
