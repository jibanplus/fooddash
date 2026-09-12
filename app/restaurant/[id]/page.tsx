'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Clock, Search, Plus, Minus, Leaf, Beef } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';
import { supabase, type Restaurant, type MenuItem } from '@/lib/supabase';

export default function RestaurantMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity, total, itemCount } = useCart();

  useEffect(() => {
    async function fetchData() {
      const [restRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', id).maybeSingle(),
        supabase.from('menu_items').select('*').eq('restaurant_id', id).order('name'),
      ]);
      if (restRes.data) setRestaurant(restRes.data as Restaurant);
      if (menuRes.data) setMenuItems(menuRes.data as MenuItem[]);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemQty = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Restaurant not found</p>
        <Link href="/restaurants">
          <Button>Browse restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover */}
      <div className="relative h-48 overflow-hidden sm:h-64">
        <img
          src={restaurant.cover_url || restaurant.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200'}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link href="/restaurants" className="absolute left-4 top-4">
          <Button variant="secondary" size="icon" className="rounded-full bg-white/90">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Restaurant Info */}
      <div className="mx-auto max-w-4xl px-4">
        <Card className="-mt-8 relative p-5 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{restaurant.cuisine}</p>
              <p className="mt-1 text-sm text-muted-foreground">{restaurant.address}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-sm font-bold text-green-600">
                <Star className="h-3.5 w-3.5 fill-green-500 text-green-500" />
                {restaurant.rating}
                <span className="font-normal text-muted-foreground">({restaurant.review_count})</span>
              </div>
              <Badge className={restaurant.is_online ? 'bg-green-500' : 'bg-gray-400'}>
                {restaurant.is_online ? 'Open Now' : 'Closed'}
              </Badge>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {restaurant.prep_time_min} min delivery
            </span>
            <span>{'$'.repeat(restaurant.price_range)}</span>
          </div>
        </Card>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
            placeholder="Search dishes..."
          />
        </div>

        {/* Menu */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold">Menu</h2>
          {filteredItems.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No items found</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredItems.map((item) => {
                const qty = getItemQty(item.id);
                return (
                  <Card
                    key={item.id}
                    className={`flex items-center gap-3 p-3 transition-all ${!item.is_available ? 'opacity-50' : 'hover:shadow-md'}`}
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        {item.is_veg ? (
                          <Leaf className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Beef className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <h3 className="font-medium">{item.name}</h3>
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 font-bold text-orange-600">₹{item.price}</p>
                    </div>
                    {item.is_available ? (
                      <div className="shrink-0">
                        {qty === 0 ? (
                          <Button
                            size="sm"
                            onClick={() => addItem(item, restaurant.id, restaurant.name)}
                            className="rounded-full bg-orange-500 hover:bg-orange-600"
                          >
                            <Plus className="h-4 w-4" />
                            ADD
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-2 py-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 rounded-full text-orange-600"
                              onClick={() => updateQuantity(item.id, qty - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-bold text-orange-600">{qty}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 rounded-full text-orange-600"
                              onClick={() => addItem(item, restaurant.id, restaurant.name)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="shrink-0">Out of Stock</Badge>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
          <div className="mx-auto max-w-4xl px-4 pb-4">
            <Link href="/checkout">
              <div className="flex items-center justify-between rounded-2xl bg-orange-500 px-5 py-3 text-white shadow-2xl transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold">
                    {itemCount}
                  </div>
                  <div>
                    <p className="font-semibold">View Cart</p>
                    <p className="text-xs opacity-80">{restaurant.name}</p>
                  </div>
                </div>
                <p className="font-bold">₹{total}</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
