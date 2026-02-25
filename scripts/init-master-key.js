import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

/**
 * Initialize Master Key for Admin Registration
 * 
 * Run this script once to set up the initial master key:
 * node scripts/init-master-key.js
 * 
 * The script will:
 * 1. Hash the master key using bcrypt
 * 2. Store it in the master_key_storage table
 * 3. Set it as active
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] ERROR: Missing Supabase credentials');
  console.error('[v0] Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Change this to your desired master key
const MASTER_KEY = process.env.ADMIN_MASTER_KEY || 'SECURE-MASTER-KEY-2024';

async function initMasterKey() {
  try {
    console.log('[v0] Initializing master key...');
    console.log(`[v0] Master Key: ${MASTER_KEY.substring(0, 5)}...`);

    // Hash the master key
    const saltRounds = 12;
    const hashedKey = await bcrypt.hash(MASTER_KEY, saltRounds);
    console.log('[v0] Master key hashed successfully');

    // Insert into database
    const { data, error } = await supabase
      .from('master_key_storage')
      .insert({
        hashed_key: hashedKey,
        is_active: true,
      })
      .select();

    if (error) {
      console.error('[v0] ERROR inserting master key:', error);
      process.exit(1);
    }

    console.log('[v0] ✓ Master key initialized successfully!');
    console.log('[v0] Master Key ID:', data[0].id);
    console.log('[v0] Created at:', data[0].created_at);
    console.log('[v0]');
    console.log('[v0] ⚠️  IMPORTANT:');
    console.log(`[v0] 1. Store this master key in a secure location: ${MASTER_KEY}`);
    console.log('[v0] 2. Share it with authorized admins only');
    console.log('[v0] 3. Admins will need this key to register');
    console.log('[v0] 4. Master key can be changed via Admin Settings');
    console.log('[v0]');
    process.exit(0);
  } catch (err) {
    console.error('[v0] ERROR:', err.message);
    process.exit(1);
  }
}

initMasterKey();
