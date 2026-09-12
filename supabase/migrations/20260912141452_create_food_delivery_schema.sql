/*
# Food Delivery Platform Schema

1. New Tables
- `categories` — food categories (Pizza, Burgers, etc.)
- `restaurants` — restaurant partner accounts with commission rates
- `delivery_partners` — delivery rider accounts with duty status
- `menu_items` — restaurant menu items with stock/price
- `orders` — customer orders with status tracking and commission
- `order_items` — individual items within an order
- `promo_codes` — discount codes for checkout
- `payouts` — vendor payout tracking

2. Security
- All tables have RLS enabled
- All tables allow anon+authenticated CRUD (multi-portal, shared data model)
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'utensils',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_categories_select" ON categories;
CREATE POLICY "anon_crud_categories_select" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_categories_insert" ON categories;
CREATE POLICY "anon_crud_categories_insert" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_categories_update" ON categories;
CREATE POLICY "anon_crud_categories_update" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_categories_delete" ON categories;
CREATE POLICY "anon_crud_categories_delete" ON categories FOR DELETE TO anon, authenticated USING (true);

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cuisine text NOT NULL DEFAULT '',
  image_url text,
  cover_url text,
  rating numeric NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  prep_time_min int NOT NULL DEFAULT 30,
  price_range int NOT NULL DEFAULT 2,
  is_online boolean NOT NULL DEFAULT true,
  is_approved boolean NOT NULL DEFAULT true,
  commission_rate numeric NOT NULL DEFAULT 15,
  address text NOT NULL DEFAULT '',
  latitude numeric,
  longitude numeric,
  phone text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_restaurants_select" ON restaurants;
CREATE POLICY "anon_crud_restaurants_select" ON restaurants FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_restaurants_insert" ON restaurants;
CREATE POLICY "anon_crud_restaurants_insert" ON restaurants FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_restaurants_update" ON restaurants;
CREATE POLICY "anon_crud_restaurants_update" ON restaurants FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_restaurants_delete" ON restaurants;
CREATE POLICY "anon_crud_restaurants_delete" ON restaurants FOR DELETE TO anon, authenticated USING (true);

-- Delivery Partners
CREATE TABLE IF NOT EXISTS delivery_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  is_on_duty boolean NOT NULL DEFAULT false,
  current_latitude numeric,
  current_longitude numeric,
  total_deliveries int NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 5,
  vehicle_type text NOT NULL DEFAULT 'bike',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_delivery_partners_select" ON delivery_partners;
CREATE POLICY "anon_crud_delivery_partners_select" ON delivery_partners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_delivery_partners_insert" ON delivery_partners;
CREATE POLICY "anon_crud_delivery_partners_insert" ON delivery_partners FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_delivery_partners_update" ON delivery_partners;
CREATE POLICY "anon_crud_delivery_partners_update" ON delivery_partners FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_delivery_partners_delete" ON delivery_partners;
CREATE POLICY "anon_crud_delivery_partners_delete" ON delivery_partners FOR DELETE TO anon, authenticated USING (true);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  is_veg boolean NOT NULL DEFAULT true,
  is_available boolean NOT NULL DEFAULT true,
  prep_time_min int NOT NULL DEFAULT 15,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_menu_items_select" ON menu_items;
CREATE POLICY "anon_crud_menu_items_select" ON menu_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_menu_items_insert" ON menu_items;
CREATE POLICY "anon_crud_menu_items_insert" ON menu_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_menu_items_update" ON menu_items;
CREATE POLICY "anon_crud_menu_items_update" ON menu_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_menu_items_delete" ON menu_items;
CREATE POLICY "anon_crud_menu_items_delete" ON menu_items FOR DELETE TO anon, authenticated USING (true);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  delivery_partner_id uuid REFERENCES delivery_partners(id),
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  customer_address text NOT NULL DEFAULT '',
  customer_latitude numeric,
  customer_longitude numeric,
  items_total numeric NOT NULL DEFAULT 0,
  delivery_charge numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'cod',
  promo_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_orders_select" ON orders;
CREATE POLICY "anon_crud_orders_select" ON orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_orders_insert" ON orders;
CREATE POLICY "anon_crud_orders_insert" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_orders_update" ON orders;
CREATE POLICY "anon_crud_orders_update" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_orders_delete" ON orders;
CREATE POLICY "anon_crud_orders_delete" ON orders FOR DELETE TO anon, authenticated USING (true);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  is_veg boolean NOT NULL DEFAULT true
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_order_items_select" ON order_items;
CREATE POLICY "anon_crud_order_items_select" ON order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_order_items_insert" ON order_items;
CREATE POLICY "anon_crud_order_items_insert" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_order_items_update" ON order_items;
CREATE POLICY "anon_crud_order_items_update" ON order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_order_items_delete" ON order_items;
CREATE POLICY "anon_crud_order_items_delete" ON order_items FOR DELETE TO anon, authenticated USING (true);

-- Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0,
  max_discount numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_promo_codes_select" ON promo_codes;
CREATE POLICY "anon_crud_promo_codes_select" ON promo_codes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_promo_codes_insert" ON promo_codes;
CREATE POLICY "anon_crud_promo_codes_insert" ON promo_codes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_promo_codes_update" ON promo_codes;
CREATE POLICY "anon_crud_promo_codes_update" ON promo_codes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_promo_codes_delete" ON promo_codes;
CREATE POLICY "anon_crud_promo_codes_delete" ON promo_codes FOR DELETE TO anon, authenticated USING (true);

-- Payouts
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_payouts_select" ON payouts;
CREATE POLICY "anon_crud_payouts_select" ON payouts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_payouts_insert" ON payouts;
CREATE POLICY "anon_crud_payouts_insert" ON payouts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_payouts_update" ON payouts;
CREATE POLICY "anon_crud_payouts_update" ON payouts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_payouts_delete" ON payouts;
CREATE POLICY "anon_crud_payouts_delete" ON payouts FOR DELETE TO anon, authenticated USING (true);
