'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Store, Bike, Settings, LogOut, 
  TrendingUp, DollarSign, Package, Clock, AlertCircle,
  ChefHat, MapPin, Phone, Check, X, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase, type Restaurant, type Order, type DeliveryPartner, ORDER_STATUS_LABELS } from '@/lib/supabase';
import { requireAuth, signOut } from '@/lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDeliveries: 0,
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    try {
      await requireAuth('admin');
      setLoading(false);
    } catch (error) {
      router.push('/login?role=admin');
    }
  };

  const fetchData = async () => {
    const [restRes, ordersRes, deliveryRes] = await Promise.all([
      supabase.from('restaurants').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('delivery_partners').select('*'),
    ]);

    if (restRes.data) {
      setRestaurants(restRes.data as Restaurant[]);
      setStats(prev => ({ ...prev, totalRestaurants: restRes.data!.length }));
    }
    if (ordersRes.data) {
      setOrders(ordersRes.data as Order[]);
      const revenue = (ordersRes.data as Order[]).reduce((sum, o) => sum + o.total, 0);
      const active = (ordersRes.data as Order[]).filter(o => 
        ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
      ).length;
      setStats(prev => ({ 
        ...prev, 
        totalOrders: ordersRes.data!.length,
        totalRevenue: revenue,
        activeDeliveries: active,
      }));
    }
    if (deliveryRes.data) {
      setDeliveryPartners(deliveryRes.data as DeliveryPartner[]);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const approveRestaurant = async (id: string) => {
    await supabase.from('restaurants').update({ is_approved: true }).eq('id', id);
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));
  };

  const rejectRestaurant = async (id: string) => {
    await supabase.from('restaurants').update({ is_approved: false }).eq('id', id);
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_approved: false } : r));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Restaurants</p>
              <p className="text-2xl font-bold">{stats.totalRestaurants}</p>
            </div>
            <Store className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Deliveries</p>
              <p className="text-2xl font-bold">{stats.activeDeliveries}</p>
            </div>
            <Bike className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold">Recent Orders</h2>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{order.customer_name}</p>
              </div>
              <div className="text-right">
                <Badge className={
                  order.status === 'pending' ? 'bg-amber-500' :
                  order.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'
                }>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <p className="mt-1 text-sm font-medium">₹{order.total}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Restaurant Details Dialog */}
      <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
          </DialogHeader>
          {selectedRestaurant && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{selectedRestaurant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cuisine</p>
                <p className="font-medium">{selectedRestaurant.cuisine}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{selectedRestaurant.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedRestaurant.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="font-medium">{selectedRestaurant.commission_rate}%</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={selectedRestaurant.is_online ? 'bg-green-500' : 'bg-gray-400'}>
                  {selectedRestaurant.is_online ? 'Online' : 'Offline'}
                </Badge>
                <Badge className={selectedRestaurant.is_approved ? 'bg-blue-500' : 'bg-red-500'}>
                  {selectedRestaurant.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}