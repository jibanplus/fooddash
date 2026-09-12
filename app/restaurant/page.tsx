'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, X, Clock, Package, Bike, Phone, MapPin, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase, type Order, type OrderItem, type Restaurant, ORDER_STATUS_LABELS } from '@/lib/supabase';

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  // For demo, use first restaurant
  const restaurantId = restaurant?.id;

  useEffect(() => {
    async function fetchData() {
      const { data: restData } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (restData) {
        setRestaurant(restData as Restaurant);
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('restaurant_id', (restData as Restaurant).id)
          .order('created_at', { ascending: false });
        if (ordersData) {
          setOrders(ordersData as Order[]);
          const itemsMap: Record<string, OrderItem[]> = {};
          for (const o of ordersData as Order[]) {
            const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
            if (items) itemsMap[o.id] = items as OrderItem[];
          }
          setOrderItems(itemsMap);
        }
      }
      setLoading(false);
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Audio alert for new pending orders
  useEffect(() => {
    const hasPending = orders.some((o) => o.status === 'pending');
    if (hasPending && !playing) {
      setPlaying(true);
      // Beep using AudioContext
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
        setTimeout(() => setPlaying(false), 1000);
      } catch {
        // ignore audio errors
      }
    }
  }, [orders, playing]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const toggleOnline = async () => {
    if (!restaurant) return;
    const newStatus = !restaurant.is_online;
    await supabase.from('restaurants').update({ is_online: newStatus }).eq('id', restaurant.id);
    setRestaurant({ ...restaurant, is_online: newStatus });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !['delivered', 'rejected', 'cancelled'].includes(o.status));

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{restaurant?.name || 'Restaurant'}</h1>
          <p className="text-sm text-muted-foreground">{activeOrders.length} active orders</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2">
          <Power className={`h-5 w-5 ${restaurant?.is_online ? 'text-green-500' : 'text-red-500'}`} />
          <span className="text-sm font-medium">{restaurant?.is_online ? 'Online' : 'Offline'}</span>
          <Switch checked={restaurant?.is_online || false} onCheckedChange={toggleOnline} />
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {activeOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No active orders</p>
            <p className="text-sm text-muted-foreground">New orders will appear here</p>
          </Card>
        ) : (
          activeOrders.map((order) => {
            const items = orderItems[order.id] || [];
            const isPending = order.status === 'pending';
            return (
              <Card
                key={order.id}
                className={`overflow-hidden ${isPending ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}`}
              >
                {isPending && (
                  <div className="flex items-center gap-2 bg-orange-500 px-4 py-2 text-white">
                    <Bell className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-bold">NEW ORDER!</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_name} • {order.customer_phone}
                      </p>
                    </div>
                    <Badge className={
                      order.status === 'pending' ? 'bg-amber-500' :
                      order.status === 'accepted' ? 'bg-blue-500' :
                      order.status === 'preparing' ? 'bg-orange-500' :
                      order.status === 'ready' ? 'bg-cyan-500' :
                      order.status === 'out_for_delivery' ? 'bg-violet-500' : 'bg-gray-500'
                    }>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="mb-3 space-y-1 rounded-lg bg-muted/50 p-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}× {item.name}</span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t pt-1 text-sm font-bold">
                      Total: ₹{order.total}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{order.customer_address}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'rejected')}
                          variant="destructive"
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="bg-cyan-500 hover:bg-cyan-600"
                      >
                        <Package className="h-4 w-4" /> Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Badge className="bg-cyan-500">Waiting for delivery partner</Badge>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <Badge className="bg-violet-500">
                        <Bike className="h-3.5 w-3.5" /> Out for delivery
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
