import { createClient } from '@supabase/supabase-js';

// Use the same configuration as in the app
const supabaseUrl = 'https://udzptgbcgzcibhbipnur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenB0Z2JjZ3pjaWJoYmlwbnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzU3MTIsImV4cCI6MjA3ODg1MTcxMn0.ddLF2U-7hue-hena6c_3qRBXXxR6-dLligG6Tivji54';

console.log('Testing Supabase connection...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test basic connection by querying a simple table
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('Connection test error:', error);
      // If it's a 404 error (table not found), that's okay, connection works
      if (error.code === '42P01') {
        console.log('✅ Connection successful! (Table not found, but connection works)');
        return true;
      }
      // If it's a permission error, connection still works
      if (error.code === '42501') {
        console.log('✅ Connection successful! (Permission denied, but connection works)');
        return true;
      }
      return false;
    }
    
    console.log('✅ Connection successful!', data);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}

// Test user creation simulation
async function testUserCreation() {
  try {
    console.log('Testing user creation...');
    
    // This would normally be handled by Supabase Auth triggers
    // Let's check if we can insert into the profiles table directly
    const testUser = {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      full_name: 'Test User',
      display_name: 'Test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(testUser);
      
    if (error) {
      console.log('User creation test result:', error);
      // This might fail due to RLS or constraints, which is expected
      return error;
    }
    
    console.log('User creation test successful:', data);
    return null;
  } catch (err) {
    console.error('User creation test failed:', err);
    return err;
  }
}

async function main() {
  console.log('Starting Supabase connection tests...\n');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('\n❌ Cannot proceed with further tests due to connection issues');
    return;
  }
  
  console.log('\n---\n');
  
  const creationError = await testUserCreation();
  if (creationError) {
    console.log('\nℹ️  User creation test completed with expected constraints');
  } else {
    console.log('\n✅ User creation test completed successfully');
  }
}

main();