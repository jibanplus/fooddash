'use client';

import { useState } from 'react';
import {
  UtensilsCrossed, ShieldCheck, Users, Store, Bike, IndianRupee,
  TrendingUp, CheckCircle2, XCircle, LogOut, Plus, Percent, Wallet,
  UserCheck, Clock, Package
} from 'lucide-react';
import { mockUsers, mockRestaurants, mockDeliveryPartners, mockPayouts, mockOrders } from '@/lib/mock-data';
import type { User, DeliveryPartner, Payout } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(mockDeliveryPartners);
  const [commissionRate, setCommissionRate] = useState(15);
  const [payouts] = useState<Payout[]>(mockPayouts);

  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCommission = mockOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const pendingApprovals = restaurants.filter((r) => r.status === 'pending').length;

  const approveRestaurant = (id: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r))
    );
    setUsers((prev) =>
      prev.map((u) => (u.id === 'u5' ? { ...u, status: 'active' as const } : u))
    );
    toast.success('Restaurant approved successfully');
  };

  const suspendRestaurant = (id: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'suspended' as const } : r))
    );
    toast.success('Restaurant suspended');
  };

  const addDeliveryPartner = () => {
    const newPartner: DeliveryPartner = {
      id: `d${deliveryPartners.length + 1}`,
      name: 'New Delivery Partner',
      phone: '+91 90000 00000',
      email: 'newpartner@delivery.com',
      status: 'available',
      totalDeliveries: 0,
      rating: 5.0,
      earnings: 0,
      vehicleType: 'Bike',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setDeliveryPartners((prev) => [...prev, newPartner]);
    toast.success('Delivery partner account created');
  };

  const updateCommission = (rate: number) => {
    setCommissionRate(rate);
    toast.success(`Default commission set to ${rate}%`);
  };

  const processPayout = (id: string) => {
    toast.success('Payout processed successfully');
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Admin Portal</p>
              <p className="text-xs text-muted-foreground">FoodDash Control Center</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/login')}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
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
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10">
                <Percent className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalCommission.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Commission Earned</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingApprovals}</p>
                <p className="text-xs text-muted-foreground">Pending Approvals</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="gap-1.5">
              <Store className="h-4 w-4" /> Restaurants
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-1.5">
              <Bike className="h-4 w-4" /> Fleet
            </TabsTrigger>
            <TabsTrigger value="commission" className="gap-1.5">
              <Percent className="h-4 w-4" /> Commission
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-1.5">
              <Wallet className="h-4 w-4" /> Payouts
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> All Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Name</th>
                        <th className="pb-3 pr-4 font-medium">Contact</th>
                        <th className="pb-3 pr-4 font-medium">Role</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 pr-4 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{user.name}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            <div>{user.email}</div>
                            <div className="text-xs">{user.phone}</div>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'destructive'}
                              className="capitalize"
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{user.joinedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" /> Restaurant Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {restaurants.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <img src={r.image} alt={r.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.cuisine} · {r.location}</p>
                        <p className="text-xs text-muted-foreground">Commission: {r.commissionRate}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={r.status === 'approved' ? 'default' : r.status === 'pending' ? 'secondary' : 'destructive'}
                        className="capitalize"
                      >
                        {r.status}
                      </Badge>
                      {r.status === 'pending' && (
                        <Button size="sm" onClick={() => approveRestaurant(r.id)}>
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                        </Button>
                      )}
                      {r.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => suspendRestaurant(r.id)}>
                          <XCircle className="mr-1 h-4 w-4" /> Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Fleet Tab */}
          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bike className="h-5 w-5" /> Delivery Fleet
                  </CardTitle>
                  <Button size="sm" onClick={addDeliveryPartner}>
                    <Plus className="mr-1 h-4 w-4" /> Add Partner
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {deliveryPartners.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Bike className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.phone} · {p.vehicleType}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.totalDeliveries} deliveries · ★ {p.rating}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={p.status === 'available' ? 'default' : p.status === 'on_delivery' ? 'secondary' : 'outline'}
                        className="capitalize"
                      >
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Tab */}
          <TabsContent value="commission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" /> Commission Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="mb-2 text-sm font-medium">Default Platform Commission Rate</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="w-16 text-center text-2xl font-bold text-primary">{commissionRate}%</span>
                  </div>
                  <Button className="mt-3" size="sm" onClick={() => updateCommission(commissionRate)}>
                    Apply to All Restaurants
                  </Button>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium">Per-Raurant Commission Rates</p>
                  <div className="space-y-2">
                    {restaurants.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-medium">{r.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={r.commissionRate}
                            onChange={(e) => {
                              setRestaurants((prev) =>
                                prev.map((rr) =>
                                  rr.id === r.id ? { ...rr, commissionRate: Number(e.target.value) } : rr
                                )
                              );
                            }}
                            className="h-8 w-16 rounded-md border px-2 text-center text-sm"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" /> Platform Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Partner</th>
                        <th className="pb-3 pr-4 font-medium">Type</th>
                        <th className="pb-3 pr-4 font-medium">Orders</th>
                        <th className="pb-3 pr-4 font-medium">Amount</th>
                        <th className="pb-3 pr-4 font-medium">Commission</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 pr-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{p.partnerName}</td>
                          <td className="py-3 pr-4">
                            <Badge variant="outline" className="capitalize">{p.type}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{p.orders}</td>
                          <td className="py-3 pr-4 font-semibold">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="py-3 pr-4 text-muted-foreground">₹{p.commission.toLocaleString('en-IN')}</td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant={p.status === 'paid' ? 'default' : p.status === 'processed' ? 'secondary' : 'outline'}
                              className="capitalize"
                            >
                              {p.status}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            {p.status === 'pending' && (
                              <Button size="sm" variant="outline" onClick={() => processPayout(p.id)}>
                                Process
                              </Button>
                            )}
                            {p.status === 'processed' && (
                              <Button size="sm" onClick={() => processPayout(p.id)}>
                                Mark Paid
                              </Button>
                            )}
                            {p.status === 'paid' && (
                              <span className="flex items-center gap-1 text-xs text-success">
                                <CheckCircle2 className="h-3 w-3" /> Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
