'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuth() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session: sessionData } } = await supabase.auth.getSession();
      setSession(sessionData);
      
      if (sessionData?.user) {
        setUser(sessionData.user);
        console.log('Current user:', sessionData.user);
        console.log('User metadata:', sessionData.user.user_metadata);
        console.log('User role:', sessionData.user.user_metadata.role);
      }
    }
    
    checkAuth();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Session Status</h2>
          <pre className="text-sm">
            {session ? 'Session Active' : 'No Session'}
          </pre>
        </div>
        
        {user && (
          <div className="p-4 bg-blue-100 rounded">
            <h2 className="font-bold mb-2">User Info</h2>
            <pre className="text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-bold mb-2">User Role</h2>
          <p className="text-lg">
            {user?.user_metadata?.role || 'No role found'}
          </p>
        </div>
        
        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-bold mb-2">Test Links</h2>
          <div className="space-y-2">
            <a href="/admin" className="block text-blue-600">Try Admin</a>
            <a href="/restaurant" className="block text-blue-600">Try Restaurant</a>
            <a href="/delivery" className="block text-blue-600">Try Delivery</a>
            <a href="/admin/login" className="block text-blue-600">Admin Login</a>
            <a href="/restaurant/login" className="block text-blue-600">Restaurant Login</a>
            <a href="/delivery/login" className="block text-blue-600">Delivery Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}