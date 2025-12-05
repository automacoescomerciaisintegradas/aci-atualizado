
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://udzptgbcgzcibhbipnur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenB0Z2JjZ3pjaWJoYmlwbnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzU3MTIsImV4cCI6MjA3ODg1MTcxMn0.ddLF2U-7hue-hena6c_3qRBXXxR6-dLligG6Tivji54';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listUsers() {
    console.log('Consultando tabela "users" no Supabase...');

    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error('Erro:', JSON.stringify(error, null, 2));
        return;
    }

    console.log('Resultado:');
    console.log(JSON.stringify(data, null, 2));
}

listUsers();
