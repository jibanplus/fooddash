'use client';

import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Order, ORDER_STATUS_LABELS } from '@/lib/supabase';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">View and manage all platform orders</p>
      </div>

      <Card className="p-6">
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{order.customer_name} • {order.customer_phone}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <Badge className={
                  order.status === 'pending' ? 'bg-amber-500' :
                  order.status === 'delivered' ? 'bg-green-500' :
                  order.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                }>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <p className="mt-1 text-sm font-medium">₹{order.total}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}