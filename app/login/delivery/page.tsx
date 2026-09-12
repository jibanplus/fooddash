'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Mail, Lock, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { signIn } from '@/lib/auth';

export default function DeliveryLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
      router.push('/delivery');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Animated Header */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full shadow-2xl">
              <Bike className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Delivery Portal
          </h1>
          <p className="mt-2 text-gray-600">Deliver orders and earn money</p>
        </div>

        <Card className="overflow-hidden shadow-2xl border-0">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="h-5 w-5" />
              <h2 className="text-xl font-bold">Delivery Partner Login</h2>
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-white/80 text-center">
              Access your delivery dashboard
            </p>
          </div>

          <div className="p-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="delivery@example.com"
                    className="pl-10 border-gray-200 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10 border-gray-200 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Start Delivering
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Want to become a delivery partner?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Contact admin to create your delivery account
              </p>
            </div>
          </div>
        </Card>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}