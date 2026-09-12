'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Tag, CreditCard, Wallet, Banknote, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/cart-context';
import { supabase, type PromoCode, type Restaurant } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, restaurantId } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const deliveryCharge = total > 300 ? 0 : 35;
  const discount = appliedPromo
    ? appliedPromo.discount_type === 'percentage'
      ? Math.min((total * appliedPromo.discount_value) / 100, appliedPromo.max_discount)
      : appliedPromo.discount_value
    : 0;
  const grandTotal = total + deliveryCharge - discount;

  useEffect(() => {
    if (restaurantId) {
      supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle().then(({ data }) => {
        if (data) setRestaurant(data as Restaurant);
      });
    }
  }, [restaurantId]);

  const applyPromo = async () => {
    if (!promoCode) return;
    setPromoError('');
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (!data) {
      setPromoError('Invalid or expired promo code');
      setAppliedPromo(null);
      return;
    }
    if (total < data.min_order) {
      setPromoError(`Minimum order ₹${data.min_order} required`);
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(data as PromoCode);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const placeOrder = async () => {
    if (!name || !phone || !address) return;
    if (!restaurantId || items.length === 0) return;
    setSubmitting(true);

    const commissionRate = restaurant?.commission_rate || 15;
    const commissionAmount = (total * commissionRate) / 100;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        items_total: total,
        delivery_charge: deliveryCharge,
        discount: discount,
        total: grandTotal,
        commission_amount: commissionAmount,
        status: 'pending',
        payment_method: paymentMethod,
        promo_code: appliedPromo?.code || null,
      })
      .select()
      .maybeSingle();

    if (error || !order) {
      setSubmitting(false);
      return;
    }

    // Insert order items
    await supabase.from('order_items').insert(
      items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        is_veg: item.is_veg,
      }))
    );

    clearCart();
    router.push(`/track/${order.id}`);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/restaurants">
          <Button className="bg-orange-500 hover:bg-orange-600">Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link href={restaurantId ? `/restaurant/${restaurantId}` : '/'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {/* Delivery Details */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <MapPin className="h-5 w-5 text-orange-500" />
            Delivery Details
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Input placeholder="Full delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-5">
          <h2 className="mb-4 font-bold">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">
                    {item.quantity}
                  </span>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item Total</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Charge</span>
              <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discount.toFixed(0)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </Card>

        {/* Promo Code */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Tag className="h-5 w-5 text-orange-500" />
            Promo Code
          </h2>
          {appliedPromo ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">{appliedPromo.code}</p>
                  <p className="text-xs text-green-600">{appliedPromo.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removePromo} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={applyPromo}>Apply</Button>
            </div>
          )}
          {promoError && <p className="mt-2 text-sm text-red-500">{promoError}</p>}
        </Card>

        {/* Payment Method */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <CreditCard className="h-5 w-5 text-orange-500" />
            Payment Method
          </h2>
          <div className="space-y-2">
            {[
              { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
              { id: 'upi', label: 'UPI / Paytm', icon: Wallet },
              { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                    paymentMethod === method.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-border hover:border-orange-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${paymentMethod === method.id ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  <span className="font-medium">{method.label}</span>
                  {paymentMethod === method.id && (
                    <Check className="ml-auto h-5 w-5 text-orange-500" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {/* API Integration Point: Connect Paytm PG SDK / UPI Intent here for live payments */}
          </p>
        </Card>

        {/* Place Order */}
        <Button
          onClick={placeOrder}
          disabled={!name || !phone || !address || submitting}
          className="w-full bg-orange-500 py-6 text-base font-bold hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? 'Placing Order...' : `Place Order — ₹${grandTotal.toFixed(0)}`}
        </Button>
      </div>
    </div>
  );
}
