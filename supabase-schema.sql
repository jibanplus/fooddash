-- FoodDash Comprehensive Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'restaurant', 'delivery', 'user');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    full_name TEXT,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Restaurants table
CREATE TABLE public.restaurants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    cuisine TEXT NOT NULL,
    image_url TEXT,
    cover_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    prep_time_min INTEGER DEFAULT 30,
    price_range INTEGER DEFAULT 2,
    is_online BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Menu items table
CREATE TABLE public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_veg BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    prep_time_min INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Orders table
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL NOT NULL,
    delivery_partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_latitude DECIMAL(10,8),
    customer_longitude DECIMAL(11,8),
    items_total DECIMAL(10,2) NOT NULL,
    delivery_charge DECIMAL(10,2) DEFAULT 30.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'rejected', 'cancelled')),
    payment_method TEXT DEFAULT 'cod',
    promo_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Order items table
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    is_veg BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Delivery partners table
CREATE TABLE public.delivery_partners (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    vehicle_type TEXT DEFAULT 'bike',
    is_on_duty BOOLEAN DEFAULT false,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Promo codes table
CREATE TABLE public.promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order DECIMAL(10,2) DEFAULT 0.00,
    max_discount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Payouts table
CREATE TABLE public.payouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User wallet table
CREATE TABLE public.user_wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Wallet transactions table
CREATE TABLE public.wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES public.user_wallets(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX idx_restaurants_online ON public.restaurants(is_online) WHERE is_online = true;
CREATE INDEX idx_restaurants_approved ON public.restaurants(is_approved) WHERE is_approved = true;
CREATE INDEX idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX idx_orders_delivery_partner ON public.orders(delivery_partner_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_delivery_partners_duty ON public.delivery_partners(is_on_duty) WHERE is_on_duty = true;
CREATE INDEX idx_promo_codes_active ON public.promo_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_user_wallets_user ON public.user_wallets(user_id);
CREATE INDEX idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for restaurants
CREATE POLICY "Public can view approved restaurants" ON public.restaurants FOR SELECT USING (is_approved = true);
CREATE POLICY "Restaurant owners can view own restaurant" ON public.restaurants FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Restaurant owners can update own restaurant" ON public.restaurants FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Admins can view all restaurants" ON public.restaurants FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update restaurants" ON public.restaurants FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert restaurants" ON public.restaurants FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for categories
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for menu items
CREATE POLICY "Public can view available menu items" ON public.menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Restaurant owners can manage own menu items" ON public.menu_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Restaurant owners can view restaurant orders" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
);
CREATE POLICY "Delivery partners can view assigned orders" ON public.orders FOR SELECT USING (delivery_partner_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Restaurant owners can update order status" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
);
CREATE POLICY "Delivery partners can update delivery status" ON public.orders FOR UPDATE USING (delivery_partner_id = auth.uid());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for order items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Restaurant owners can view restaurant order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.menu_items WHERE id = menu_item_id AND restaurant_id IN (
        SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    ))
);

-- RLS Policies for delivery partners
CREATE POLICY "Delivery partners can view own profile" ON public.delivery_partners FOR SELECT USING (id = auth.uid());
CREATE POLICY "Delivery partners can update own profile" ON public.delivery_partners FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can view all delivery partners" ON public.delivery_partners FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage delivery partners" ON public.delivery_partners FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for promo codes
CREATE POLICY "Public can view active promo codes" ON public.promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for payouts
CREATE POLICY "Restaurant owners can view own payouts" ON public.payouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can manage payouts" ON public.payouts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for user wallets
CREATE POLICY "Users can view own wallet" ON public.user_wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own wallet" ON public.user_wallets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all wallets" ON public.user_wallets FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for wallet transactions
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_wallets WHERE id = wallet_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default categories
INSERT INTO public.categories (name, icon, sort_order) VALUES
('Pizza', 'pizza', 1),
('Burger', 'burger', 2),
('Chinese', 'bowl-food', 3),
('South Indian', 'utensils', 4),
('North Indian', 'chef-hat', 5),
('Bengali', 'sparkles', 6),
('Italian', 'pizza', 7),
('Mexican', 'flame', 8),
('Thai', 'flame', 9),
('Japanese', 'fish', 10),
('Continental', 'utensils', 11),
('Biryani', 'rice', 12),
('Desserts', 'cake', 13),
('Beverages', 'coffee', 14),
('Snacks', 'cookie', 15),
('Healthy', 'leaf', 16),
('Seafood', 'fish', 17);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone'
    );
    
    -- Create wallet for new users
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role = 'user' THEN
        INSERT INTO public.user_wallets (user_id, balance)
        VALUES (NEW.id, 0.00);
    END IF;
    
    -- Create delivery partner profile if role is delivery
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role = 'delivery' THEN
        INSERT INTO public.delivery_partners (id, vehicle_type)
        VALUES (NEW.id, 'bike');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profile timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_partners_updated_at BEFORE UPDATE ON public.delivery_partners
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON public.user_wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin account (run this after the main schema)
-- This will create the admin user in Supabase Auth and the profile
-- IMPORTANT: You need to manually create the auth user first, then run this to set the role

-- Uncomment and run these lines after creating the auth user:
-- UPDATE public.profiles 
-- SET role = 'admin', full_name = 'Admin User'
-- WHERE email = 'jibanraja@gmail.com';

-- Alternative: Insert directly (requires auth user to exist first)
-- INSERT INTO public.profiles (id, email, role, full_name)
-- VALUES (
--     (SELECT id FROM auth.users WHERE email = 'jibanraja@gmail.com'),
--     'jibanraja@gmail.com',
--     'admin',
--     'Admin User'
-- ) ON CONFLICT (id) DO UPDATE SET 
--     role = 'admin',
--     full_name = 'Admin User';

-- Manual setup instructions:
-- 1. Go to Supabase Dashboard -> Authentication -> Users
-- 2. Create a new user with email: jibanraja@gmail.com, password: 52335233
-- 3. Then run this SQL to set the admin role:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'jibanraja@gmail.com';