export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export type RestaurantStatus = 'pending' | 'approved' | 'suspended';

export type DeliveryPartnerStatus = 'offline' | 'available' | 'on_delivery';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isBestseller?: boolean;
  addons?: { name: string; price: number }[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  priceForTwo: number;
  image: string;
  coverImage: string;
  status: RestaurantStatus;
  location: string;
  menu: MenuItem[];
  commissionRate: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  addons: { name: string; price: number }[];
  total: number;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  acceptedAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  commissionAmount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: DeliveryPartnerStatus;
  totalDeliveries: number;
  rating: number;
  earnings: number;
  vehicleType: string;
  joinedAt: string;
}

export interface Payout {
  id: string;
  type: 'restaurant' | 'delivery';
  partnerName: string;
  amount: number;
  commission: number;
  status: 'pending' | 'processed' | 'paid';
  date: string;
  orders: number;
}
