'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, MapPin, Phone, Mail, Wallet, History, ShoppingBag, 
  LogOut, Settings, CreditCard, Bell, Heart, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase, type Order, type OrderItem, ORDER_STATUS_LABELS } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function UserProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login?role=user');
        return;
      }
      setUser(currentUser);
      setProfileData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: '',
      });
      setLoading(false);
    } catch (error) {
      router.push('/login?role=user');
    }
  };

  const fetchData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    // For demo, fetch all orders (in real app, filter by user_id)
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (ordersData) {
      setOrders(ordersData as Order[]);
      
      const itemsMap: Record<string, OrderItem[]> = {};
      for (const order of ordersData as Order[]) {
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        if (items) itemsMap[order.id] = items as OrderItem[];
      }
      setOrderItems(itemsMap);

      // Calculate wallet balance (refunds, cashback, etc.)
      const balance = (ordersData as Order[])
        .filter(o => o.status === 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);
      setWalletBalance(balance);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const updateProfile = async () => {
    // In real app, update user profile in database
    setEditProfileOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl font-bold text-white">
                F
              </div>
              <span className="text-xl font-bold">FoodDash</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                  </div>
                  <History className="h-8 w-8 text-green-500" />
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Order History</h2>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <ShoppingBag className="mx-auto mb-3 h-12 w-12" />
                    <p>No orders yet</p>
                    <Link href="/">
                      <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                        Start Ordering
                      </Button>
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const items = orderItems[order.id] || [];
                    return (
                      <Card key={order.id} className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                          </div>
                          <Badge className={
                            order.status === 'pending' ? 'bg-amber-500' :
                            order.status === 'delivered' ? 'bg-green-500' :
                            order.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                          }>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                        
                        <div className="mb-3 space-y-1 rounded-lg bg-muted/50 p-3">
                          {items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantity}× {item.name}</span>
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          {items.length > 3 && (
                            <p className="text-xs text-muted-foreground">+{items.length - 3} more items</p>
                          )}
                          <div className="border-t pt-1 text-sm font-bold">
                            Total: ₹{order.total}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/track/${order.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Track Order
                            </Button>
                          </Link>
                          {order.status === 'delivered' && (
                            <Button size="sm" variant="outline">
                              Reorder
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Wallet Balance</h2>
                  <p className="text-muted-foreground">Available for orders</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">₹{walletBalance.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Current balance</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-500 hover:bg-green-600">
                  <CreditCard className="mr-2 h-4 w-4" /> Add Money
                </Button>
                <Button variant="outline" className="flex-1">
                  <History className="mr-2 h-4 w-4" /> Transaction History
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Payment Methods</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Add</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold">Profile Information</h2>
                <Button size="sm" onClick={() => setEditProfileOpen(true)}>
                  Edit Profile
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{user?.name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user?.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Default Address</p>
                    <p className="font-medium">{profileData.address || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Saved Addresses</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Home</p>
                      <p className="text-sm text-muted-foreground">MG Road, Bengaluru</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Default</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" /> Add New Address
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Favorites</h2>
              <div className="py-8 text-center text-muted-foreground">
                <Heart className="mx-auto mb-3 h-12 w-12" />
                <p>No favorite restaurants yet</p>
                <Link href="/restaurants">
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                    Discover Restaurants
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive order updates via SMS</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive real-time order updates</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Preferences</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <select className="mt-1 w-full rounded-md border p-2">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Bengali</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <select className="mt-1 w-full rounded-md border p-2">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-red-600">Danger Zone</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full text-red-600 border-red-600">
                  Delete Account
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Default Address</label>
              <Input
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                placeholder="MG Road, Bengaluru"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button onClick={updateProfile} className="bg-orange-500 hover:bg-orange-600">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}