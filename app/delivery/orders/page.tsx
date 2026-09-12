'use client';

import { useEffect, useState } from 'react';
import { Package, Check, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Order, type OrderItem, ORDER_STATUS_LABELS } from '@/lib/supabase';

export default function DeliveryOrders() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});

  useEffect(() => {
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    // For demo, use first delivery partner
    const { data: partnerData } = await supabase
      .from('delivery_partners')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (partnerData) {
      const { data: activeData } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_partner_id', (partnerData as any).id)
        .in('status', ['out_for_delivery'])
        .order('created_at', { ascending: false });
      
      if (activeData) {
        setActiveOrders(activeData as Order[]);
        
        const itemsMap: Record<string, OrderItem[]> = {};
        for (const order of activeData as Order[]) {
          const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
          if (items) itemsMap[order.id] = items as OrderItem[];
        }
        setOrderItems(itemsMap);
      }
    }
  };

  const completeDelivery = async (orderId: string) => {
    await supabase
      .from('orders')
      .update({ 
        status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    fetchActiveOrders();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Active Deliveries</h1>
        <p className="text-muted-foreground">Manage your current deliveries</p>
      </div>

      <Card className="p-6">
        {activeOrders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Package className="mx-auto mb-3 h-12 w-12" />
            <p>No active deliveries</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const items = orderItems[order.id] || [];
              return (
                <Card key={order.id} className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name} • {order.customer_phone}</p>
                    </div>
                    <Badge className="bg-violet-500">
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  
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

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      <Navigation className="mr-2 h-4 w-4" /> Navigate
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => completeDelivery(order.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Check className="mr-2 h-4 w-4" /> Mark Delivered
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}