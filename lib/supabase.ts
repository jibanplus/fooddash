import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  cuisine: string;
  image_url: string | null;
  cover_url: string | null;
  rating: number;
  review_count: number;
  prep_time_min: number;
  price_range: number;
  is_online: boolean;
  is_approved: boolean;
  commission_rate: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  image_url: string | null;
  sort_order: number;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  prep_time_min: number;
  created_at: string;
};

export type Order = {
  id: string;
  restaurant_id: string;
  delivery_partner_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_latitude: number | null;
  customer_longitude: number | null;
  items_total: number;
  delivery_charge: number;
  discount: number;
  total: number;
  commission_amount: number;
  status: string;
  payment_method: string;
  promo_code: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
  is_veg: boolean;
};

export type DeliveryPartner = {
  id: string;
  name: string;
  phone: string;
  is_on_duty: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  total_deliveries: number;
  total_earnings: number;
  rating: number;
  vehicle_type: string;
  created_at: string;
};

export type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order: number;
  max_discount: number;
  is_active: boolean;
};

export type Payout = {
  id: string;
  restaurant_id: string;
  amount: number;
  status: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
};

export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'rejected',
  'cancelled',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  accepted: 'Order Accepted',
  preparing: 'Preparing Food',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  accepted: 'bg-blue-500',
  preparing: 'bg-orange-500',
  ready: 'bg-cyan-500',
  out_for_delivery: 'bg-violet-500',
  delivered: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-red-500',
};
