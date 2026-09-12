// Run this script with: node create-admin.js
// Make sure to set your Supabase credentials in .env.local first

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminAccount() {
  const adminEmail = 'admin@fooddash.com';
  const adminPassword = 'Admin@123';
  const adminName = 'Admin User';

  try {
    // Create admin user
    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          role: 'admin',
          full_name: adminName,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('Admin account already exists!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
      } else {
        throw error;
      }
    } else {
      console.log('Admin account created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
    }
  } catch (error) {
    console.error('Error creating admin account:', error.message);
  }
}

createAdminAccount();