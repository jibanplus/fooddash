import { supabase } from './supabase';

export type UserRole = 'admin' | 'restaurant' | 'delivery' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
}

export async function signUp(email: string, password: string, role: UserRole, additionalData?: Partial<AuthUser>) {
  // Restrict signup for admin, restaurant, and delivery roles
  if (role === 'admin' || role === 'restaurant' || role === 'delivery') {
    throw new Error(`${role.charAt(0).toUpperCase() + role.slice(1)} accounts can only be created by the admin. Please contact the administrator.`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: additionalData?.full_name,
        phone: additionalData?.phone,
      },
      emailRedirectTo: `${window.location.origin}/login/user`,
    },
  });

  if (error) {
    // Handle specific error messages
    if (error.message.includes('already registered')) {
      throw new Error('Email already registered. Please login instead.');
    }
    throw error;
  }
  
  // Return success without requiring OTP verification for now
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Handle specific error messages
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    }
    if (error.message.includes('Email not confirmed')) {
      throw new Error('Please verify your email address before logging in.');
    }
    throw error;
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function verifyOTP(email: string, token: string) {
  // OTP verification disabled for development
  throw new Error('OTP verification is currently disabled. You can login directly.');
}

export async function resendOTP(email: string) {
  // OTP resend disabled for development
  throw new Error('OTP verification is currently disabled. You can login directly.');
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login/user?reset=true`,
  });

  if (error) {
    if (error.message.includes('User not found')) {
      throw new Error('No account found with this email address.');
    }
    throw error;
  }
  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    if (error.message.includes('Password should be')) {
      throw new Error('Password does not meet requirements.');
    }
    throw error;
  }
  return data;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch user profile from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    // Fallback to metadata if profile doesn't exist
    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata.role as UserRole || 'user',
      full_name: user.user_metadata.full_name,
      phone: user.user_metadata.phone,
    };
  }

  return {
    id: user.id,
    email: user.email || '',
    role: profile.role as UserRole,
    full_name: profile.full_name,
    phone: profile.phone,
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