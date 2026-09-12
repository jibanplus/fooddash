'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, MapPin, Clock, DollarSign, 
  Wallet, LogOut, Bike, Check, Phone,
  Navigation, Star, TrendingUp, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase, type Order, type DeliveryPartner } from '@/lib/supabase';
import { requireAuth, signOut } from '@/lib/auth';

export default function DeliveryDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    checkAuth();
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      await requireAuth('delivery');
      setLoading(false);
    } catch (error) {
      router.push('/login?role=delivery');
    }
  };

  const fetchData = async () => {
    // For demo, use first delivery partner
    const { data: partnerData } = await supabase
      .from('delivery_partners')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (partnerData) {
      setDeliveryPartner(partnerData as DeliveryPartner);
      setWalletBalance(partnerData.total_earnings);

      // Fetch available orders (ready status)
      const { data: availableData } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'ready')
        .isnull('delivery_partner_id')
        .order('created_at', { ascending: false });
      
      if (availableData) {
        setAvailableOrders(availableData as Order[]);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const acceptOrder = async (orderId: string) => {
    if (!deliveryPartner) return;
    
    await supabase
      .from('orders')
      .update({ 
        delivery_partner_id: deliveryPartner.id,
        status: 'out_for_delivery',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
    fetchData();
  };

  const completeDelivery = async (orderId: string) => {
    await supabase
      .from('orders')
      .update({ 
        status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    // Update delivery partner stats
    if (deliveryPartner) {
      const newDeliveries = deliveryPartner.total_deliveries + 1;
      const deliveryCharge = 30; // Fixed delivery charge
      const newEarnings = deliveryPartner.total_earnings + deliveryCharge;
      
      await supabase
        .from('delivery_partners')
        .update({ 
          total_deliveries: newDeliveries,
          total_earnings: newEarnings
        })
        .eq('id', deliveryPartner.id);
      
      setDeliveryPartner({ 
        ...deliveryPartner, 
        total_deliveries: newDeliveries,
        total_earnings: newEarnings 
      });
      setWalletBalance(newEarnings);
    }
    
    fetchData();
  };

  const toggleDutyStatus = async () => {
    if (!deliveryPartner) return;
    const newStatus = !deliveryPartner.is_on_duty;
    
    await supabase
      .from('delivery_partners')
      .update({ is_on_duty: newStatus })
      .eq('id', deliveryPartner.id);
    
    setDeliveryPartner({ ...deliveryPartner, is_on_duty: newStatus });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!deliveryPartner) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg font-medium">Delivery partner not found</p>
          <Button onClick={() => router.push('/login?role=delivery')} className="mt-4">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {deliveryPartner?.name || 'Partner'}!</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2">
          <Bike className={`h-5 w-5 ${deliveryPartner?.is_on_duty ? 'text-green-500' : 'text-red-500'}`} />
          <span className="text-sm font-medium">{deliveryPartner?.is_on_duty ? 'On Duty' : 'Off Duty'}</span>
          <Switch checked={deliveryPartner?.is_on_duty || false} onCheckedChange={toggleDutyStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Earnings</p>
              <p className="text-2xl font-bold">₹{walletBalance.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Deliveries</p>
              <p className="text-2xl font-bold">{deliveryPartner?.total_deliveries || 0}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{deliveryPartner?.rating || 0}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Orders</p>
              <p className="text-2xl font-bold">{availableOrders.length}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold">Available Orders</h2>
        {availableOrders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Package className="mx-auto mb-3 h-12 w-12" />
            <p>No orders available right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_address}</p>
                  <p className="text-xs text-muted-foreground mt-1">₹{order.total} • Delivery: ₹30</p>
                </div>
                <Button 
                  onClick={() => acceptOrder(order.id)}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={!deliveryPartner?.is_on_duty}
                >
                  <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Navigation Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Navigate to Customer</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer Address</p>
                <p className="font-medium">{selectedOrder.customer_address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <p className="font-medium">{selectedOrder.customer_phone}</p>
                </div>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                <Navigation className="mr-2 h-4 w-4" /> Open in Maps
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}