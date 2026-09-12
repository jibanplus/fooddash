'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Store, Bike, User, LayoutDashboard, Mail, Lock, 
  ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { signUp, signIn, type UserRole } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as UserRole || 'user';
  
  const [activeTab, setActiveTab] = useState(defaultRole);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const roleConfig: Record<UserRole, { icon: any, title: string, color: string, description: string }> = {
    admin: { icon: LayoutDashboard, title: 'Admin', color: 'bg-purple-500', description: 'Platform management' },
    restaurant: { icon: Store, title: 'Restaurant', color: 'bg-orange-500', description: 'Manage your restaurant' },
    delivery: { icon: Bike, title: 'Delivery', color: 'bg-green-500', description: 'Deliver orders' },
    user: { icon: User, title: 'Customer', color: 'bg-blue-500', description: 'Order food' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          const routes: Record<UserRole, string> = {
            admin: '/admin',
            restaurant: '/restaurant',
            delivery: '/delivery',
            user: '/',
          };
          router.push(routes[activeTab as UserRole]);
        }, 1000);
      } else {
        await signUp(formData.email, formData.password, activeTab as UserRole, {
          name: formData.name,
          phone: formData.phone,
        });
        setSuccess('Account created! Please login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const config = roleConfig[activeTab as UserRole];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`${config.color} px-6 py-8 text-white`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold">{config.title} Portal</h1>
          <p className="text-center text-white/80">{config.description}</p>
        </div>

        <div className="p-6">
          {/* Role Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as UserRole); setIsLogin(true); setError(''); setSuccess(''); }}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="user" className="text-xs">
                <User className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="text-xs">
                <Store className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="delivery" className="text-xs">
                <Bike className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-xs">
                <LayoutDashboard className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Login/Register Toggle */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant={isLogin ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={isLogin ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={!isLogin ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              Sign Up
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-center text-sm text-muted-foreground">Demo Accounts</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('admin');
                  setFormData({ email: 'admin@fooddash.com', password: 'admin123', name: '', phone: '' });
                  setIsLogin(true);
                }}
              >
                <LayoutDashboard className="mr-2 h-4 w-4 text-purple-500" />
                Admin Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('restaurant');
                  setFormData({ email: 'restaurant@fooddash.com', password: 'restaurant123', name: '', phone: '' });
                  setIsLogin(true);
                }}
              >
                <Store className="mr-2 h-4 w-4 text-orange-500" />
                Restaurant Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('delivery');
                  setFormData({ email: 'delivery@fooddash.com', password: 'delivery123', name: '', phone: '' });
                  setIsLogin(true);
                }}
              >
                <Bike className="mr-2 h-4 w-4 text-green-500" />
                Delivery Demo
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}