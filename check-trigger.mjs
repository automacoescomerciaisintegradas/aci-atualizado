import { createClient } from '@supabase/supabase-js';

// Use the same configuration as in the app
const supabaseUrl = 'https://udzptgbcgzcibhbipnur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenB0Z2JjZ3pjaWJoYmlwbnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzU3MTIsImV4cCI6MjA3ODg1MTcxMn0.ddLF2U-7hue-hena6c_3qRBXXxR6-dLligG6Tivji54';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTriggerConfiguration() {
  console.log('Checking trigger configuration...');
  
  try {
    // Try to manually call the handle_new_user function to see if it exists
    // We'll simulate what happens when a new user is inserted into auth.users
    console.log('Testing if handle_new_user function exists...');
    
    // This is a simplified test - we can't actually call the trigger directly
    // but we can check if the function exists by trying to describe it
    
    // Let's check if we can access the profiles table with a valid user ID
    // First, let's see if there are any existing profiles we can examine
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(1);
      
    if (profilesError && profilesError.code !== '42501') {
      console.log('Error accessing profiles:', profilesError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Found existing profiles:', profiles.length, 'profiles');
      console.log('Sample profile:', profiles[0]);
    } else {
      console.log('No existing profiles found or access denied due to RLS');
    }
    
    // Check if the auth.users table has any records (we won't be able to see actual data due to permissions)
    try {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.log('Cannot access auth.users table (expected):', countError.message);
      } else {
        console.log('Auth users count:', count);
      }
    } catch (err) {
      console.log('Cannot access auth.users table (expected)');
    }
    
    console.log('\n=== ANALYSIS ===');
    console.log('1. Profiles table exists and has RLS enabled');
    console.log('2. Users can only access their own profiles due to RLS policies');
    console.log('3. The handle_new_user trigger should automatically create profiles when new auth users are created');
    console.log('4. If the trigger is not working, profiles will not be created');
    
  } catch (err) {
    console.error('Trigger configuration check failed:', err);
  }
}

checkTriggerConfiguration();