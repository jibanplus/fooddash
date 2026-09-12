'use client';

import { useState } from 'react';
import { UserPlus, Store, Bike, Mail, Lock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

export default function CreateAccount() {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    cuisine: '',
    address: '',
  });

  const [deliveryForm, setDeliveryForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    vehicleType: 'bike',
  });

  const createRestaurantAccount = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: restaurantForm.email,
        password: restaurantForm.password,
        options: {
          data: {
            role: 'restaurant',
            full_name: restaurantForm.name,
            phone: restaurantForm.phone,
          },
        },
      });

      if (authError) throw authError;

      // Create restaurant profile
      if (authData.user) {
        const { error: restaurantError } = await supabase.from('restaurants').insert({
          owner_id: authData.user.id,
          name: restaurantForm.name,
          cuisine: restaurantForm.cuisine,
          address: restaurantForm.address,
          phone: restaurantForm.phone,
          is_approved: false,
        });

        if (restaurantError) throw restaurantError;
      }

      setSuccess('Restaurant account created successfully!');
      setRestaurantForm({
        email: '',
        password: '',
        name: '',
        phone: '',
        cuisine: '',
        address: '',
      });
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const createDeliveryAccount = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: deliveryForm.email,
        password: deliveryForm.password,
        options: {
          data: {
            role: 'delivery',
            full_name: deliveryForm.name,
            phone: deliveryForm.phone,
          },
        },
      });

      if (authError) throw authError;

      // Create delivery partner profile
      if (authData.user) {
        const { error: deliveryError } = await supabase.from('delivery_partners').insert({
          id: authData.user.id,
          vehicle_type: deliveryForm.vehicleType,
        });

        if (deliveryError) throw deliveryError;
      }

      setSuccess('Delivery partner account created successfully!');
      setDeliveryForm({
        email: '',
        password: '',
        name: '',
        phone: '',
        vehicleType: 'bike',
      });
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Accounts</h1>
          <p className="text-muted-foreground">Create restaurant and delivery partner accounts</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-purple-500 hover:bg-purple-600">
          <UserPlus className="mr-2 h-4 w-4" /> New Account
        </Button>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
            <TabsTrigger value="delivery">Delivery Partners</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurant" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Store className="mx-auto mb-3 h-12 w-12" />
              <p>Click "New Account" to create a restaurant account</p>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Bike className="mx-auto mb-3 h-12 w-12" />
              <p>Click "New Account" to create a delivery partner account</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Create Account Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Partner</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurant" className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Restaurant Name</label>
                <Input
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                  placeholder="Restaurant Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    value={restaurantForm.email}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
                    placeholder="restaurant@example.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    value={restaurantForm.password}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={restaurantForm.phone}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cuisine Type</label>
                <Input
                  value={restaurantForm.cuisine}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })}
                  placeholder="e.g., Indian, Chinese, Italian"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={restaurantForm.address}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                  placeholder="Full restaurant address"
                />
              </div>
              <Button onClick={createRestaurantAccount} className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? 'Creating...' : 'Create Restaurant Account'}
              </Button>
            </TabsContent>

            <TabsContent value="delivery" className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={deliveryForm.name}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                  placeholder="Delivery Partner Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    value={deliveryForm.email}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, email: e.target.value })}
                    placeholder="delivery@example.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    value={deliveryForm.password}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={deliveryForm.phone}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Vehicle Type</label>
                <select
                  value={deliveryForm.vehicleType}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, vehicleType: e.target.value })}
                  className="w-full rounded-md border p-2"
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="cycle">Cycle</option>
                </select>
              </div>
              <Button onClick={createDeliveryAccount} className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
                {loading ? 'Creating...' : 'Create Delivery Account'}
              </Button>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}