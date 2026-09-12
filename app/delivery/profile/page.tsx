'use client';

import { useEffect, useState } from 'react';
import { User, Bike, Star, MapPin, Phone, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type DeliveryPartner } from '@/lib/supabase';

export default function DeliveryProfile() {
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('delivery_partners')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setDeliveryPartner(data as DeliveryPartner);
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
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your delivery partner profile</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <Bike className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{deliveryPartner.name}</p>
            <p className="text-sm text-muted-foreground">{deliveryPartner.phone}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Vehicle Type</p>
            <p className="font-medium">{deliveryPartner.vehicle_type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Deliveries</p>
            <p className="font-medium">{deliveryPartner.total_deliveries}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rating</p>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <p className="font-medium">{deliveryPartner.rating} / 5.0</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="font-medium">₹{deliveryPartner.total_earnings.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className={deliveryPartner.is_on_duty ? 'bg-green-500' : 'bg-gray-400'}>
              {deliveryPartner.is_on_duty ? 'On Duty' : 'Off Duty'}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold">Performance Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{deliveryPartner.total_deliveries}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{deliveryPartner.rating}</p>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </div>
        </div>
      </Card>
    </div>
  );
}