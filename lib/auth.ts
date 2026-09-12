import { supabase } from './supabase';

export type UserRole = 'admin' | 'restaurant' | 'delivery' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
}

export async function signUp(email: string, password: string, role: UserRole, additionalData?: Partial<AuthUser>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        ...additionalData,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const role = user.user_metadata.role as UserRole;
  return {
    id: user.id,
    email: user.email || '',
    role,
    name: user.user_metadata.name,
    phone: user.user_metadata.phone,
  };
}

export async function requireAuth(role?: UserRole): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  if (role && user.role !== role) {
    throw new Error('Unauthorized');
  }
  return user;
}