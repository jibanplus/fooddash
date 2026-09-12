'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Check, Clock, Package, Bike, Home, ChefHat, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Order, type OrderItem, type Restaurant, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/supabase';

const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Check },
  { key: 'accepted', label: 'Order Accepted', icon: Check },
  { key: 'preparing', label: 'Preparing Food', icon: ChefHat },
  { key: 'ready', label: 'Ready for Pickup', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const { data: orderData } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
      if (!orderData) {
        setLoading(false);
        return;
      }
      setOrder(orderData as Order);

      const [itemsRes, restRes] = await Promise.all([
        supabase.from('order_items').select('*').eq('order_id', id),
        supabase.from('restaurants').select('*').eq('id', (orderData as Order).restaurant_id).maybeSingle(),
      ]);
      if (itemsRes.data) setOrderItems(itemsRes.data as OrderItem[]);
      if (restRes.data) setRestaurant(restRes.data as Restaurant);
      setLoading(false);
    }
    fetchOrder();
    // Poll for updates
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Order not found</p>
        <Link href="/"><Button>Go Home</Button></Link>
      </div>
    );
  }

  const currentStepIndex = TRACKING_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'rejected' || order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-muted/30 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 px-4 py-8 text-white">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="mb-4 inline-block text-sm text-white/80 hover:text-white">
            ← Back to home
          </Link>
          <h1 className="text-2xl font-bold">Track Your Order</h1>
          <p className="mt-1 text-white/80">Order #{id.slice(0, 8).toUpperCase()}</p>
          <div className="mt-2">
            <Badge className="bg-white/20 text-white">
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        {isCancelled ? (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-red-600">Order {ORDER_STATUS_LABELS[order.status]}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your order was {order.status}. Please contact support for assistance.</p>
          </Card>
        ) : (
          <>
            {/* Tracking Timeline */}
            <Card className="p-6">
              <h2 className="mb-6 font-bold">Order Status</h2>
              <div className="space-y-1">
                {TRACKING_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isComplete = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isPending = index > currentStepIndex;
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      {/* Line + Icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                            isComplete
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-orange-500 text-white animate-pulse-ring'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < TRACKING_STEPS.length - 1 && (
                          <div className={`h-12 w-0.5 ${isComplete ? 'bg-green-500' : 'bg-border'}`} />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pb-12">
                        <p className={`font-medium ${isPending ? 'text-muted-foreground' : ''}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-orange-500">In progress...</p>
                        )}
                        {isComplete && (
                          <p className="text-sm text-green-600">Completed</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Delivery Info */}
            {order.status === 'out_for_delivery' && (
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                    <Bike className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Your delivery partner is on the way!</p>
                    <p className="text-sm text-muted-foreground">Estimated arrival in 10-15 minutes</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Order Details */}
            <Card className="p-5">
              <h2 className="mb-4 font-bold">Order Details</h2>
              {restaurant && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <img
                    src={restaurant.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100'}
                    alt={restaurant.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{restaurant.name}</p>
                    <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.quantity}× {item.name}</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1 border-t pt-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charge</span>
                  <span>₹{order.delivery_charge}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </Card>

            {/* Delivery Address */}
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 font-bold">
                <MapPin className="h-5 w-5 text-orange-500" />
                Delivery Address
              </h2>
              <p className="text-sm text-muted-foreground">{order.customer_address}</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_name} • {order.customer_phone}</span>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
