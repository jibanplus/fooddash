import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  vehicle_type: string;
  is_on_duty: boolean;
  total_deliveries: number;
  total_earnings: number;
  rating: number;
  current_location?: {
    lat: number;
    lng: number;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  cuisine_type: string;
  rating: number;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  delivery_partner_id?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  customer_name: string;
  customer_phone: string;
  restaurant_name: string;
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
