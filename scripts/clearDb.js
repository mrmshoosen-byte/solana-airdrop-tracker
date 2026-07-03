const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function clear() {
  try {
    console.log('🗑️ Clearing database...');
    await pool.query('DELETE FROM airdrop_recipients;');
    await pool.query('DELETE FROM wallet_token_states;');
    await pool.query('DELETE FROM wallets;');
    console.log('✅ Database cleared');
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clear();
