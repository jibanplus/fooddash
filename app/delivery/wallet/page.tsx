'use client';

import { useEffect, useState } from 'react';
import { Wallet, DollarSign, CreditCard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase, type Order, type DeliveryPartner } from '@/lib/supabase';

export default function DeliveryWallet() {
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: partnerData } = await supabase
      .from('delivery_partners')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (partnerData) {
      setDeliveryPartner(partnerData as DeliveryPartner);

      const { data: historyData } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_partner_id', (partnerData as DeliveryPartner).id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (historyData) {
        setOrderHistory(historyData as Order[]);
      }
    }
  };

  if (!deliveryPartner) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-lg font-medium">Delivery partner not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and payouts</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Wallet Balance</h2>
            <p className="text-muted-foreground">Your total earnings</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">₹{deliveryPartner.total_earnings.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Available for withdrawal</p>
          </div>
        </div>
        <Button className="w-full bg-green-500 hover:bg-green-600">
          <CreditCard className="mr-2 h-4 w-4" /> Withdraw Funds
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold">Earnings History</h2>
        <div className="space-y-3">
          {orderHistory.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+₹30</p>
                <p className="text-xs text-muted-foreground">Delivery charge</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}