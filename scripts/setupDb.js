#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');

// Explicitly load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`📁 Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

console.log(`✅ DATABASE_URL loaded: ${process.env.DATABASE_URL ? 'YES' : 'NO'}`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const schema = `
-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  mint_address VARCHAR(44) UNIQUE NOT NULL,
  symbol VARCHAR(20),
  name VARCHAR(255),
  decimals INT DEFAULT 6,
  initial_supply BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  address VARCHAR(44) UNIQUE NOT NULL,
  first_seen_block BIGINT,
  first_seen_at TIMESTAMP,
  total_airdrops_received INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_address (address)
);

-- Airdrop recipients table
CREATE TABLE IF NOT EXISTS airdrop_recipients (
  id SERIAL PRIMARY KEY,
  token_id INT NOT NULL,
  wallet_id INT NOT NULL,
  amount_received BIGINT NOT NULL,
  received_at TIMESTAMP NOT NULL,
  transaction_hash VARCHAR(88),
  block_height BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (token_id) REFERENCES tokens(id),
  FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  UNIQUE(token_id, wallet_id),
  INDEX idx_token_wallet (token_id, wallet_id),
  INDEX idx_received_at (received_at)
);

-- Token transfers table
CREATE TABLE IF NOT EXISTS token_transfers (
  id SERIAL PRIMARY KEY,
  token_id INT NOT NULL,
  from_wallet_id INT,
  to_wallet_id INT,
  amount BIGINT NOT NULL,
  transaction_hash VARCHAR(88),
  block_height BIGINT,
  timestamp TIMESTAMP NOT NULL,
  instruction_index INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (token_id) REFERENCES tokens(id),
  FOREIGN KEY (from_wallet_id) REFERENCES wallets(id),
  FOREIGN KEY (to_wallet_id) REFERENCES wallets(id),
  INDEX idx_token_tx (token_id, transaction_hash),
  INDEX idx_from_wallet (from_wallet_id),
  INDEX idx_to_wallet (to_wallet_id),
  INDEX idx_timestamp (timestamp)
);

-- Swap events table
CREATE TABLE IF NOT EXISTS swap_events (
  id SERIAL PRIMARY KEY,
  wallet_id INT NOT NULL,
  token_id INT NOT NULL,
  tokens_out BIGINT NOT NULL,
  tokens_in_mint VARCHAR(44),
  tokens_in_amount BIGINT,
  transaction_hash VARCHAR(88),
  block_height BIGINT,
  timestamp TIMESTAMP NOT NULL,
  price_impact_percent FLOAT,
  dex VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  FOREIGN KEY (token_id) REFERENCES tokens(id),
  INDEX idx_wallet_token (wallet_id, token_id),
  INDEX idx_timestamp (timestamp)
);

-- Wallet token states table
CREATE TABLE IF NOT EXISTS wallet_token_states (
  id SERIAL PRIMARY KEY,
  wallet_id INT NOT NULL,
  token_id INT NOT NULL,
  current_balance BIGINT NOT NULL DEFAULT 0,
  original_airdrop_amount BIGINT NOT NULL DEFAULT 0,
  total_bought BIGINT NOT NULL DEFAULT 0,
  total_sold BIGINT NOT NULL DEFAULT 0,
  behavior_status VARCHAR(20),
  last_activity TIMESTAMP,
  estimated_value FLOAT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  FOREIGN KEY (token_id) REFERENCES tokens(id),
  UNIQUE(wallet_id, token_id),
  INDEX idx_wallet_token (wallet_id, token_id),
  INDEX idx_behavior (behavior_status)
);

-- Sync metadata table
CREATE TABLE IF NOT EXISTS sync_metadata (
  id SERIAL PRIMARY KEY,
  token_id INT NOT NULL,
  last_synced_block BIGINT,
  last_synced_at TIMESTAMP,
  recipients_count INT,
  sync_status VARCHAR(20),
  FOREIGN KEY (token_id) REFERENCES tokens(id),
  UNIQUE(token_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_airdrop_token ON airdrop_recipients(token_id);
CREATE INDEX IF NOT EXISTS idx_airdrop_wallet ON airdrop_recipients(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transfers_token ON token_transfers(token_id);
CREATE INDEX IF NOT EXISTS idx_swaps_wallet_token ON swap_events(wallet_id, token_id);
CREATE INDEX IF NOT EXISTS idx_states_wallet_token ON wallet_token_states(wallet_id, token_id);
`;

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database schema...');
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ Database schema created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
