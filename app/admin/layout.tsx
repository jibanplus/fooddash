'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Package, Bike, Settings, LogOut, UserPlus } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/restaurants', label: 'Restaurants', icon: Store },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/delivery', label: 'Delivery', icon: Bike },
  { href: '/admin/create-account', label: 'Create Account', icon: UserPlus },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-white md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500 text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">FoodDash</p>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-purple-50 text-purple-600' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <Link href="/admin/login" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-white md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                isActive ? 'text-purple-600' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}