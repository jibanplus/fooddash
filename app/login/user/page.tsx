'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Sparkles, ShoppingBag, Utensils, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { signUp, signIn } from '@/lib/auth';

export default function UserLogin() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => router.push('/'), 1000);
      } else {
        await signUp(formData.email, formData.password, 'user', {
          full_name: formData.fullName,
          phone: formData.phone,
        });
        setSuccess('Account created successfully! You can now login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Animated Header */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-full shadow-2xl">
              <ShoppingBag className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            FoodDash
          </h1>
          <p className="mt-2 text-gray-600">Your favorite food, delivered fast</p>
        </div>

        <Card className="overflow-hidden shadow-2xl border-0">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-xl font-bold">
                {isLogin ? 'Welcome Back!' : 'Join FoodDash'}
              </h2>
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-white/80 text-center">
              {isLogin ? 'Login to order your favorite food' : 'Create account to start ordering'}
            </p>
          </div>

          <div className="p-6">
            {/* Toggle */}
            <div className="flex items-center justify-center gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  isLogin 
                    ? 'bg-white shadow text-orange-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  !isLogin 
                    ? 'bg-white shadow text-orange-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="pl-10 border-gray-200 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="pl-10 border-gray-200 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="pl-10 border-gray-200 focus:border-orange-500"
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
                    className="pl-10 border-gray-200 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isLogin ? 'Login' : 'Create Account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-orange-100 p-2 rounded-full mb-2">
                    <Utensils className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-600">1000+ Restaurants</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-red-100 p-2 rounded-full mb-2">
                    <Sparkles className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-xs text-gray-600">Fast Delivery</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-pink-100 p-2 rounded-full mb-2">
                    <ShoppingBag className="h-4 w-4 text-pink-600" />
                  </div>
                  <p className="text-xs text-gray-600">Best Prices</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}