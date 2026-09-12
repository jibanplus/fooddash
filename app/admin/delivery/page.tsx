'use client';

import { useEffect, useState } from 'react';
import { Bike, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase, type DeliveryPartner } from '@/lib/supabase';

export default function AdminDelivery() {
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    const { data } = await supabase.from('delivery_partners').select('*');
    if (data) setDeliveryPartners(data as DeliveryPartner[]);
  };

  const toggleDutyStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('delivery_partners').update({ is_on_duty: !currentStatus }).eq('id', id);
    setDeliveryPartners(prev => prev.map(p => p.id === id ? { ...p, is_on_duty: !currentStatus } : p));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Delivery Partners</h1>
        <p className="text-muted-foreground">Manage delivery fleet and partners</p>
      </div>

      <Card className="p-6">
        <div className="space-y-3">
          {deliveryPartners.map((partner) => (
            <div key={partner.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Bike className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{partner.name}</p>
                  <p className="text-sm text-muted-foreground">{partner.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={partner.is_on_duty ? 'bg-green-500' : 'bg-gray-400'}>
                      {partner.is_on_duty ? 'On Duty' : 'Off Duty'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{partner.total_deliveries} deliveries</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">₹{partner.total_earnings.toLocaleString()}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <p className="text-xs text-muted-foreground">Rating: {partner.rating}</p>
                  </div>
                </div>
                <Switch 
                  checked={partner.is_on_duty} 
                  onCheckedChange={() => toggleDutyStatus(partner.id, partner.is_on_duty)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}