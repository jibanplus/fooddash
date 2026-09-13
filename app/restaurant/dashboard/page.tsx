'use client';

import { useState, useMemo } from 'react';
import {
  UtensilsCrossed, Store, Clock, CheckCircle2, ChefHat, Bell,
  TrendingUp, IndianRupee, Package, ArrowLeft, LogOut, Star
} from 'lucide-react';
import { mockOrders, mockRestaurants } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const restaurant = mockRestaurants[0];

export default function RestaurantDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => o.restaurantId === 'r1')
  );

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status };
          if (status === 'accepted') updated.acceptedAt = new Date().toISOString();
          if (status === 'ready') updated.readyAt = new Date().toISOString();
          return updated;
        }
        return o;
      })
    );
    const labels: Record<OrderStatus, string> = {
      placed: 'placed',
      accepted: 'accepted',
      preparing: 'marked as preparing',
      ready: 'marked as ready for pickup',
      picked_up: 'picked up',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    toast.success(`Order ${labels[status]}`);
  };

  const newOrders = orders.filter((o) => o.status === 'placed');
  const activeOrders = orders.filter((o) => ['accepted', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  const todayRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const todayOrders = orders.length;
  const avgRating = restaurant.rating;

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">{restaurant.name}</p>
              <p className="text-xs text-muted-foreground">Restaurant Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/restaurant/login')}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{todayRevenue}</p>
                <p className="text-xs text-muted-foreground">Today's Revenue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayOrders}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10">
                <Bell className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{newOrders.length}</p>
                <p className="text-xs text-muted-foreground">New Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="new" className="gap-1.5">
              <Bell className="h-4 w-4" /> New ({newOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-1.5">
              <ChefHat className="h-4 w-4" /> Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* New Orders */}
          <TabsContent value="new" className="space-y-4">
            {newOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-semibold">No new orders</p>
                  <p className="text-sm text-muted-foreground">New orders will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              newOrders.map((order) => (
                <OrderCard key={order.id} order={order} variant="new" onAction={updateOrderStatus} />
              ))
            )}
          </TabsContent>

          {/* Active Orders */}
          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ChefHat className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-semibold">No active orders</p>
                  <p className="text-sm text-muted-foreground">Accepted orders will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} variant="active" onAction={updateOrderStatus} />
              ))
            )}
          </TabsContent>

          {/* Completed Orders */}
          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-semibold">No completed orders yet</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} variant="completed" onAction={updateOrderStatus} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  variant,
  onAction,
}: {
  order: Order;
  variant: 'new' | 'active' | 'completed';
  onAction: (orderId: string, status: OrderStatus) => void;
}) {
  const statusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      placed: { label: 'New', variant: 'default' },
      accepted: { label: 'Accepted', variant: 'secondary' },
      preparing: { label: 'Preparing', variant: 'secondary' },
      ready: { label: 'Ready', variant: 'default' },
      picked_up: { label: 'Picked Up', variant: 'secondary' },
      delivered: { label: 'Delivered', variant: 'secondary' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
    };
    return map[status];
  };

  const badge = statusBadge(order.status);

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{order.orderId}</span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{order.customerName} · {order.customerPhone}</p>
            <p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">₹{order.total}</p>
            <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
          </div>
        </div>

        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-sm font-medium">Order Items:</p>
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}× {item.menuItem.name}
                  {item.addons.length > 0 && (
                    <span className="text-muted-foreground"> ({item.addons.map((a) => a.name).join(', ')})</span>
                  )}
                </span>
                <span className="font-medium">₹{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        {variant === 'new' && (
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => onAction(order.id, 'accepted')}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Accept Order
            </Button>
            <Button
              variant="outline"
              onClick={() => onAction(order.id, 'cancelled')}
            >
              Reject
            </Button>
          </div>
        )}

        {variant === 'active' && order.status === 'accepted' && (
          <div className="mt-4">
            <Button className="w-full" onClick={() => onAction(order.id, 'preparing')}>
              <ChefHat className="mr-1.5 h-4 w-4" /> Start Preparing
            </Button>
          </div>
        )}

        {variant === 'active' && order.status === 'preparing' && (
          <div className="mt-4">
            <Button className="w-full" onClick={() => onAction(order.id, 'ready')}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark as Ready
            </Button>
          </div>
        )}

        {variant === 'active' && order.status === 'ready' && (
          <div className="mt-4 rounded-lg bg-success/10 p-3 text-center text-sm font-medium text-success">
            <Bell className="mr-1.5 inline h-4 w-4" /> Waiting for delivery partner pickup
          </div>
        )}
      </CardContent>
    </Card>
  );
}
