import { createClient } from '@supabase/supabase-js';

// Use the same configuration as in the app
const supabaseUrl = 'https://udzptgbcgzcibhbipnur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenB0Z2JjZ3pjaWJoYmlwbnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzU3MTIsImV4cCI6MjA3ODg1MTcxMn0.ddLF2U-7hue-hena6c_3qRBXXxR6-dLligG6Tivji54';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfilesConstraints() {
  console.log('Checking profiles table constraints...');
  
  try {
    // Try to get table info
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);
      
    if (error) {
      console.log('Error accessing profiles table:', error);
      return;
    }
    
    console.log('✅ Successfully accessed profiles table');
    
    // Check if we can insert a minimal profile
    const testProfile = {
      id: 'test-profile-' + Date.now(),
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Testing profile insertion with minimal data...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert(testProfile);
      
    if (insertError) {
      console.log('❌ Profile insertion failed:', insertError);
      console.log('This indicates a constraint violation or permission issue');
    } else {
      console.log('✅ Profile insertion successful');
      
      // Clean up test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testProfile.id);
    }
    
  } catch (err) {
    console.error('Constraint check failed:', err);
  }
}

checkProfilesConstraints();