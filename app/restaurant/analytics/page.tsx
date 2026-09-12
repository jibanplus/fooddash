'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, IndianRupee, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase, type Order, type Restaurant, type Payout } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: restData } = await supabase.from('restaurants').select('*').limit(1).maybeSingle();
      if (restData) {
        setRestaurant(restData as Restaurant);
        const [ordersRes, payoutsRes] = await Promise.all([
          supabase.from('orders').select('*').eq('restaurant_id', (restData as Restaurant).id).order('created_at', { ascending: false }),
          supabase.from('payouts').select('*').eq('restaurant_id', (restData as Restaurant).id).order('created_at', { ascending: false }),
        ]);
        if (ordersRes.data) setOrders(ordersRes.data as Order[]);
        if (payoutsRes.data) setPayouts(payoutsRes.data as Payout[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const weekOrders = orders.filter((o) => {
    const diff = Date.now() - new Date(o.created_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  });
  const todayRevenue = todayOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const weekRevenue = weekOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const commissionRate = restaurant?.commission_rate || 15;

  // Simple chart data - last 7 days
  const last7Days: { label: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toDateString();
    const dayRevenue = orders
      .filter((o) => new Date(o.created_at).toDateString() === dayStr && o.status === 'delivered')
      .reduce((s, o) => s + o.total, 0);
    last7Days.push({ label: date.toLocaleDateString('en', { weekday: 'short' }), revenue: dayRevenue });
  }
  const maxRevenue = Math.max(...last7Days.map((d) => d.revenue), 1);

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-6 text-2xl font-bold">Earnings & Analytics</h1>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
            <span className="text-xs font-medium">Today&apos;s Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">₹{todayRevenue.toFixed(0)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">This Week</span>
          </div>
          <p className="mt-2 text-2xl font-bold">₹{weekRevenue.toFixed(0)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs font-medium">Today&apos;s Orders</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{todayOrders.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Total Delivered</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{orders.filter((o) => o.status === 'delivered').length}</p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-bold">Revenue (Last 7 Days)</h2>
        <div className="flex h-48 items-end justify-between gap-2">
          {last7Days.map((day, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-orange-400 to-orange-500 transition-all hover:from-orange-500 hover:to-orange-600"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                  title={`₹${day.revenue.toFixed(0)}`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Commission Info */}
      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-bold">Commission Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Revenue (all time)</span>
            <span className="font-bold">₹{totalRevenue.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Commission Rate</span>
            <span className="font-bold">{commissionRate}%</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Commission Deducted</span>
            <span className="font-bold">₹{(totalRevenue * commissionRate / 100).toFixed(0)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-green-600">
            <span className="font-bold">Net Earnings</span>
            <span className="font-bold">₹{(totalRevenue * (100 - commissionRate) / 100).toFixed(0)}</span>
          </div>
        </div>
      </Card>

      {/* Payout History */}
      <Card className="p-5">
        <h2 className="mb-4 font-bold">Payout History</h2>
        {payouts.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No payouts yet</p>
        ) : (
          <div className="space-y-2">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">₹{payout.amount.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">
                    {payout.period_start ? new Date(payout.period_start).toLocaleDateString() : ''} - {payout.period_end ? new Date(payout.period_end).toLocaleDateString() : ''}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  payout.status === 'completed' ? 'bg-green-100 text-green-700' :
                  payout.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {payout.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
