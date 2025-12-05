
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://udzptgbcgzcibhbipnur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenB0Z2JjZ3pjaWJoYmlwbnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzU3MTIsImV4cCI6MjA3ODg1MTcxMn0.ddLF2U-7hue-hena6c_3qRBXXxR6-dLligG6Tivji54';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedAdmin() {
    console.log('--- INICIANDO SEED ---');

    // Generate a random UUID v4 manually to avoid crypto dependency issues if any
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    console.log(`Tentando inserir usuário com ID: ${uuid}`);

    const { data, error } = await supabase
        .from('users')
        .insert([
            {
                id: uuid,
                name: 'Admin Teste Script',
                email: `admin_${Date.now()}@aci.com`,
                role: 'admin',
                status: 'active',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            }
        ])
        .select();

    if (error) {
        console.error('!!! ERRO AO INSERIR !!!');
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log('>>> SUCESSO <<<');
        console.log(JSON.stringify(data, null, 2));
    }
}

seedAdmin().catch(err => console.error('Unhandled error:', err));
