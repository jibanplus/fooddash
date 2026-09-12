'use client';

import { useEffect, useState } from 'react';
import { Store, Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, type Restaurant } from '@/lib/supabase';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    const { data } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
    if (data) setRestaurants(data as Restaurant[]);
  };

  const approveRestaurant = async (id: string) => {
    await supabase.from('restaurants').update({ is_approved: true }).eq('id', id);
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));
  };

  const rejectRestaurant = async (id: string) => {
    await supabase.from('restaurants').update({ is_approved: false }).eq('id', id);
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_approved: false } : r));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Restaurant Management</h1>
        <p className="text-muted-foreground">Approve and manage restaurant partners</p>
      </div>

      <Card className="p-6">
        <div className="space-y-3">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Store className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">{restaurant.name}</p>
                  <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={restaurant.is_online ? 'bg-green-500' : 'bg-gray-400'}>
                      {restaurant.is_online ? 'Online' : 'Offline'}
                    </Badge>
                    <Badge className={restaurant.is_approved ? 'bg-blue-500' : 'bg-red-500'}>
                      {restaurant.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!restaurant.is_approved && (
                  <>
                    <Button size="sm" onClick={() => approveRestaurant(restaurant.id)} className="bg-green-500 hover:bg-green-600">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectRestaurant(restaurant.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedRestaurant(restaurant)}>
                  <Eye className="h-4 w-4" />
                </Button>
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