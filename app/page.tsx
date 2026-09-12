'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Navigation, Star, Clock, TrendingUp, ChevronRight, Utensils, Pizza, Burger, Cake, Coffee, Soup } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Restaurant, type Category } from '@/lib/supabase';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pizza: Pizza,
  burger: Burger,
  'bowl-food': Soup,
  utensils: Utensils,
  cake: Cake,
  coffee: Coffee,
};

export default function Home() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('Detecting location...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [restRes, catRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('is_online', true).eq('is_approved', true).order('rating', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      if (restRes.data) setRestaurants(restRes.data);
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    }
    fetchData();
    setAddress('MG Road, Bengaluru');
  }, []);

  const detectLocation = () => {
    setAddress('Detecting...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setAddress('Current Location, Bengaluru'),
        () => setAddress('MG Road, Bengaluru')
      );
    } else {
      setAddress('MG Road, Bengaluru');
    }
  };

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 pb-20 pt-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-6xl px-4">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-2xl font-bold text-orange-500">
                F
              </div>
              <span className="text-2xl font-bold text-white">FoodDash</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/restaurant" className="text-sm font-medium text-white/90 hover:text-white">
                Restaurant
              </Link>
              <Link href="/delivery" className="text-sm font-medium text-white/90 hover:text-white">
                Delivery
              </Link>
              <Link href="/admin" className="text-sm font-medium text-white/90 hover:text-white">
                Admin
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="py-8 text-center">
            <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Craving something?
              <br />
              <span className="text-white/90">We&apos;ll deliver it.</span>
            </h1>
            <p className="mb-8 text-lg text-white/80">
              Order from your favorite restaurants in just a few taps
            </p>

            {/* Address Bar */}
            <div className="mx-auto mb-4 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl">
              <MapPin className="ml-2 h-5 w-5 shrink-0 text-orange-500" />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border-0 bg-transparent text-gray-700 focus-visible:ring-0"
                placeholder="Enter your delivery address"
              />
              <Button
                onClick={detectLocation}
                size="sm"
                variant="ghost"
                className="shrink-0 text-orange-500 hover:text-orange-600"
              >
                <Navigation className="h-4 w-4" />
                GPS
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl">
              <Search className="ml-2 h-5 w-5 shrink-0 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
                placeholder="Search for restaurants or cuisines..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push(`/restaurants?q=${encodeURIComponent(searchQuery)}`);
                }}
              />
              <Button
                onClick={() => router.push(`/restaurants?q=${encodeURIComponent(searchQuery)}`)}
                className="shrink-0 bg-orange-500 hover:bg-orange-600"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mx-auto -mt-12 max-w-6xl px-4">
        <Card className="glass-card p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-bold">What&apos;s on your mind?</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.icon] || Utensils;
              return (
                <Link
                  key={cat.id}
                  href={`/restaurants?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500 transition-colors hover:bg-orange-100">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-medium">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Restaurants */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Top Rated Restaurants
          </h2>
          <Link href="/restaurants" className="text-sm font-medium text-orange-500 hover:underline flex items-center gap-1">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.slice(0, 6).map((rest) => (
              <Link key={rest.id} href={`/restaurant/${rest.id}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={rest.cover_url || rest.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'}
                      alt={rest.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-sm font-bold text-green-600 shadow">
                      <Star className="h-3.5 w-3.5 fill-green-500 text-green-500" />
                      {rest.rating}
                    </div>
                    <div className="absolute right-2 top-2">
                      <Badge className={rest.is_online ? 'bg-green-500' : 'bg-gray-400'}>
                        {rest.is_online ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 font-bold text-lg">{rest.name}</h3>
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-1">{rest.cuisine}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {rest.prep_time_min} min
                      </span>
                      <span className="flex items-center gap-1">
                        {'$'.repeat(rest.price_range)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Promo Banner */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white">
            <p className="text-sm font-medium opacity-90">Use code</p>
            <p className="text-2xl font-bold">WELCOME50</p>
            <p className="mt-1 text-sm opacity-80">50% off on first order up to Rs.100</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 p-6 text-white">
            <p className="text-sm font-medium opacity-90">Use code</p>
            <p className="text-2xl font-bold">FREEDEL</p>
            <p className="mt-1 text-sm opacity-80">Free delivery on orders above Rs.300</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 p-6 text-white">
            <p className="text-sm font-medium opacity-90">Use code</p>
            <p className="text-2xl font-bold">SAVE20</p>
            <p className="mt-1 text-sm opacity-80">20% off up to Rs.80</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">FoodDash</p>
          <p>Your favorite food, delivered fast. © 2026 FoodDash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
