'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Star, Clock, Filter, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, type Restaurant } from '@/lib/supabase';

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('rating');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurants() {
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_online', true)
        .eq('is_approved', true);
      if (data) {
        setRestaurants(data);
        setFiltered(data);
      }
      setLoading(false);
    }
    fetchRestaurants();
  }, []);

  useEffect(() => {
    let result = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(query.toLowerCase())
    );
    if (initialCategory) {
      result = result.filter((r) => r.cuisine.toLowerCase().includes(initialCategory.toLowerCase()));
    }
    if (priceFilter !== 'all') {
      result = result.filter((r) => r.price_range === parseInt(priceFilter));
    }
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'prep_time') result.sort((a, b) => a.prep_time_min - b.prep_time_min);
    if (sortBy === 'price_low') result.sort((a, b) => a.price_range - b.price_range);
    setFiltered(result);
  }, [query, restaurants, sortBy, priceFilter, initialCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex flex-1 items-center gap-2 rounded-xl border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
              placeholder="Search restaurants or cuisines..."
            />
          </div>
        </div>
        {/* Filters */}
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] shrink-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="prep_time">Fastest Delivery</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-[140px] shrink-0">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="1">$</SelectItem>
              <SelectItem value="2">$$</SelectItem>
              <SelectItem value="3">$$$</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-xl font-bold">
          {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} near you
        </h1>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">No restaurants found</p>
            <p className="text-sm text-muted-foreground">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((rest) => (
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
                      <span>{'$'.repeat(rest.price_range)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div></Suspense>
}>
      <RestaurantsContent />
    </Suspense>
  );
}
