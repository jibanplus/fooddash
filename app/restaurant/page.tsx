'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, X, Clock, Package, Bike, Phone, MapPin, Power, Wallet, History, User, TrendingUp, DollarSign, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase, type Order, type OrderItem, type Restaurant, ORDER_STATUS_LABELS } from '@/lib/supabase';
import { requireAuth, signOut } from '@/lib/auth';

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [walletBalance, setWalletBalance] = useState(0);

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
        
        const [ordersData, historyData] = await Promise.all([
          supabase
            .from('orders')
            .select('*')
            .eq('restaurant_id', (restData as Restaurant).id)
            .in('status', ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery'])
            .order('created_at', { ascending: false }),
          supabase
            .from('orders')
            .select('*')
            .eq('restaurant_id', (restData as Restaurant).id)
            .in('status', ['delivered', 'cancelled', 'rejected'])
            .order('created_at', { ascending: false })
            .limit(50),
        ]);
        
        if (ordersData.data) {
          setOrders(ordersData.data as Order[]);
          const itemsMap: Record<string, OrderItem[]> = {};
          for (const o of ordersData.data as Order[]) {
            const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
            if (items) itemsMap[o.id] = items as OrderItem[];
          }
          setOrderItems(itemsMap);
        }
        
        if (historyData.data) {
          setOrderHistory(historyData.data as Order[]);
          const totalRevenue = (historyData.data as Order[])
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.total - o.commission_amount), 0);
          setWalletBalance(totalRevenue);
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

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/restaurant/login';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl font-bold text-white">
              R
            </div>
            <div>
              <h1 className="text-xl font-bold">{restaurant?.name || 'Restaurant'}</h1>
              <p className="text-sm text-muted-foreground">{activeOrders.length} active orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2">
              <Power className={`h-5 w-5 ${restaurant?.is_online ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm font-medium">{restaurant?.is_online ? 'Online' : 'Offline'}</span>
              <Switch checked={restaurant?.is_online || false} onCheckedChange={toggleOnline} />
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <Power className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                    <p className="text-2xl font-bold">{activeOrders.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-2xl font-bold">₹{walletBalance.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orderHistory.length}</p>
                  </div>
                  <History className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Commission Rate</p>
                    <p className="text-2xl font-bold">{restaurant?.commission_rate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </Card>
            </div>

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
                            <Badge className="bg-cyan-500">
                              <Package className="h-3.5 w-3.5 mr-1" /> Ready for Pickup
                            </Badge>
                          )}
                          {order.status === 'out_for_delivery' && (
                            <Badge className="bg-violet-500">
                              <Bike className="h-3.5 w-3.5 mr-1" /> Out for delivery
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <Card className="p-6 text-center">
              <Utensils className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <h2 className="text-lg font-medium">Menu Management</h2>
              <p className="text-sm text-muted-foreground mb-4">Manage your restaurant menu</p>
              <Link href="/restaurant/menu">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Go to Menu Management
                </Button>
              </Link>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Wallet Balance</h2>
                  <p className="text-muted-foreground">Your earnings after commission</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">₹{walletBalance.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Available for withdrawal</p>
                </div>
              </div>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Withdraw Funds
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Recent Transactions</h2>
              <div className="space-y-3">
                {orderHistory.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+₹{(order.total - order.commission_amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">After commission</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Restaurant Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Restaurant Status</p>
                    <p className="text-sm text-muted-foreground">Toggle online/offline status</p>
                  </div>
                  <Switch checked={restaurant?.is_online || false} onCheckedChange={toggleOnline} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Restaurant Name</p>
                  <p className="font-medium">{restaurant?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cuisine Type</p>
                  <p className="font-medium">{restaurant?.cuisine}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{restaurant?.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{restaurant?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="font-medium">{restaurant?.commission_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">{restaurant?.rating} / 5.0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <Badge className={restaurant?.is_online ? 'bg-green-500' : 'bg-gray-400'}>
                      {restaurant?.is_online ? 'Online' : 'Offline'}
                    </Badge>
                    <Badge className={restaurant?.is_approved ? 'bg-blue-500' : 'bg-red-500'}>
                      {restaurant?.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Performance Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{orderHistory.filter(o => o.status === 'delivered').length}</p>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{restaurant?.rating}</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
