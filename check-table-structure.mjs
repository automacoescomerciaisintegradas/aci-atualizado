import { createClient } from '@supabase/supabase-js';

// Use the same configuration as in the app
const supabaseUrl = 'https://udzptgbcgzcibhbipnur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenB0Z2JjZ3pjaWJoYmlwbnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzU3MTIsImV4cCI6MjA3ODg1MTcxMn0.ddLF2U-7hue-hena6c_3qRBXXxR6-dLligG6Tivji54';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('Checking table structures and constraints...');
  
  try {
    // Check the structure of the profiles table
    console.log('\n=== PROFILES TABLE STRUCTURE ===');
    
    // Since we can't directly query the schema in this environment,
    // let's try inserting a properly formatted record to see what constraints might be violated
    
    // Generate a valid UUID for testing
    const validUUID = '12345678-1234-1234-1234-123456789012';
    const timestamp = new Date().toISOString();
    
    const testProfile = {
      id: validUUID,
      email: 'test@example.com',
      created_at: timestamp,
      updated_at: timestamp
    };
    
    console.log('Testing profile insertion with valid UUID...');
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(testProfile);
      
    if (error) {
      console.log('❌ Profile insertion failed:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      
      // Check if it's a duplicate key error
      if (error.code === '23505') {
        console.log('This is a unique constraint violation - email or ID already exists');
        
        // Try to delete the test record if it exists
        await supabase
          .from('profiles')
          .delete()
          .eq('id', validUUID);
          
        // Try again with a different ID
        const newUUID = '87654321-4321-4321-4321-210987654321';
        const newTestProfile = {
          ...testProfile,
          id: newUUID
        };
        
        console.log('Trying with a different UUID...');
        const { data: newData, error: newError } = await supabase
          .from('profiles')
          .insert(newTestProfile);
          
        if (newError) {
          console.log('❌ Second attempt also failed:', newError);
        } else {
          console.log('✅ Second attempt succeeded');
          
          // Clean up
          await supabase
            .from('profiles')
            .delete()
            .eq('id', newUUID);
        }
      }
    } else {
      console.log('✅ Profile insertion successful');
      
      // Clean up
      await supabase
        .from('profiles')
        .delete()
        .eq('id', validUUID);
    }
    
  } catch (err) {
    console.error('Table structure check failed:', err);
  }
}

checkTableStructure();