'use client';

import Link from 'next/link';
import { User, Store, Bike, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Choose Your Login Portal
          </h1>
          <p className="mt-2 text-gray-600">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Login */}
          <Link href="/login/user">
            <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-full mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Customer</h3>
                <p className="text-sm text-gray-600 mb-4">Order food from your favorite restaurants</p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Login <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Link>

          {/* Restaurant Login */}
          <Link href="/restaurant/login">
            <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-full mb-4">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Restaurant Partner</h3>
                <p className="text-sm text-gray-600 mb-4">Manage your restaurant and orders</p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Login <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Link>

          {/* Delivery Login */}
          <Link href="/delivery/login">
            <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full mb-4">
                  <Bike className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Delivery Partner</h3>
                <p className="text-sm text-gray-600 mb-4">Deliver orders and earn money</p>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Login <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}