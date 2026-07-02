const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/airdrop_tracker',
    });
  }

  /**
   * Store token metadata
   */
  async upsertToken(tokenMint, metadata) {
    try {
      const query = `
        INSERT INTO tokens (mint_address, decimals, initial_supply)
        VALUES ($1, $2, $3)
        ON CONFLICT (mint_address) 
        DO UPDATE SET decimals = $2, initial_supply = $3, updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;
      
      const result = await this.pool.query(query, [
        tokenMint,
        metadata.decimals || 6,
        metadata.totalSupplyRaw || 0
      ]);

      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error upserting token:', error);
      throw error;
    }
  }

  /**
   * Get or create wallet
   */
  async upsertWallet(walletAddress) {
    try {
      const query = `
        INSERT INTO wallets (address, first_seen_at)
        VALUES ($1, CURRENT_TIMESTAMP)
        ON CONFLICT (address)
        DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;

      const result = await this.pool.query(query, [walletAddress]);
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error upserting wallet:', error);
      throw error;
    }
  }

  /**
   * Store airdrop recipient
   */
  async storeAirdropRecipient(tokenId, walletId, amount, receivedAt, txHash) {
    try {
      const query = `
        INSERT INTO airdrop_recipients (token_id, wallet_id, amount_received, received_at, transaction_hash)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (token_id, wallet_id)
        DO UPDATE SET amount_received = $3, received_at = $4
        RETURNING id;
      `;

      const result = await this.pool.query(query, [
        tokenId,
        walletId,
        amount,
        receivedAt,
        txHash
      ]);

      return result.rows[0]?.id;
    } catch (error) {
      console.error('❌ Error storing airdrop recipient:', error);
      throw error;
    }
  }

  /**
   * Get all airdrop recipients for a token
   */
  async getAirdropRecipients(tokenId, limit = 1000) {
    try {
      const query = `
        SELECT 
          ar.id,
          w.address,
          ar.amount_received,
          ar.received_at,
          wts.current_balance,
          wts.behavior_status,
          wts.estimated_value
        FROM airdrop_recipients ar
        JOIN wallets w ON ar.wallet_id = w.id
        LEFT JOIN wallet_token_states wts ON wts.wallet_id = ar.wallet_id AND wts.token_id = ar.token_id
        WHERE ar.token_id = $1
        ORDER BY ar.amount_received DESC
        LIMIT $2;
      `;

      const result = await this.pool.query(query, [tokenId, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting airdrop recipients:', error);
      throw error;
    }
  }

  /**
   * Get wallet by address
   */
  async getWalletByAddress(address) {
    try {
      const query = 'SELECT id, address FROM wallets WHERE address = $1;';
      const result = await this.pool.query(query, [address]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting wallet:', error);
      throw error;
    }
  }

  /**
   * Get token by mint address
   */
  async getTokenByMint(mint) {
    try {
      const query = 'SELECT id, mint_address, decimals FROM tokens WHERE mint_address = $1;';
      const result = await this.pool.query(query, [mint]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      throw error;
    }
  }

  /**
   * Store token transfer
   */
  async storeTokenTransfer(tokenId, fromWalletId, toWalletId, amount, txHash, blockHeight, timestamp) {
    try {
      const query = `
        INSERT INTO token_transfers (token_id, from_wallet_id, to_wallet_id, amount, transaction_hash, block_height, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING;
      `;

      await this.pool.query(query, [
        tokenId,
        fromWalletId || null,
        toWalletId || null,
        amount,
        txHash,
        blockHeight,
        new Date(timestamp * 1000)
      ]);
    } catch (error) {
      console.error('❌ Error storing token transfer:', error);
      throw error;
    }
  }

  /**
   * Store swap event
   */
  async storeSwapEvent(walletId, tokenId, tokensOut, txHash, blockHeight, timestamp, dex) {
    try {
      const query = `
        INSERT INTO swap_events (wallet_id, token_id, tokens_out, transaction_hash, block_height, timestamp, dex)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING;
      `;

      await this.pool.query(query, [
        walletId,
        tokenId,
        tokensOut,
        txHash,
        blockHeight,
        new Date(timestamp * 1000),
        dex
      ]);
    } catch (error) {
      console.error('❌ Error storing swap event:', error);
      throw error;
    }
  }

  /**
   * Update wallet token state
   */
  async updateWalletTokenState(walletId, tokenId, state) {
    try {
      const query = `
        INSERT INTO wallet_token_states (wallet_id, token_id, current_balance, original_airdrop_amount, total_bought, total_sold, behavior_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (wallet_id, token_id)
        DO UPDATE SET 
          current_balance = $3,
          original_airdrop_amount = $4,
          total_bought = $5,
          total_sold = $6,
          behavior_status = $7,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;

      const result = await this.pool.query(query, [
        walletId,
        tokenId,
        state.currentBalance || 0,
        state.originalAirdropAmount || 0,
        state.totalBought || 0,
        state.totalSold || 0,
        state.behaviorStatus || 'UNKNOWN'
      ]);

      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error updating wallet token state:', error);
      throw error;
    }
  }

  /**
   * Get wallet token state
   */
  async getWalletTokenState(walletId, tokenId) {
    try {
      const query = `
        SELECT * FROM wallet_token_states 
        WHERE wallet_id = $1 AND token_id = $2;
      `;

      const result = await this.pool.query(query, [walletId, tokenId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting wallet token state:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a token
   */
  async getTokenAnalytics(tokenId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_recipients,
          SUM(CASE WHEN wts.behavior_status = 'SOLD' THEN 1 ELSE 0 END) as sold_count,
          SUM(CASE WHEN wts.behavior_status = 'HELD' THEN 1 ELSE 0 END) as held_count,
          SUM(CASE WHEN wts.behavior_status = 'ACCUMULATED' THEN 1 ELSE 0 END) as accumulated_count,
          ROUND(100.0 * SUM(CASE WHEN wts.behavior_status = 'SOLD' THEN 1 ELSE 0 END) / COUNT(*), 2) as sold_percentage,
          ROUND(100.0 * SUM(CASE WHEN wts.behavior_status = 'HELD' THEN 1 ELSE 0 END) / COUNT(*), 2) as held_percentage,
          ROUND(100.0 * SUM(CASE WHEN wts.behavior_status = 'ACCUMULATED' THEN 1 ELSE 0 END) / COUNT(*), 2) as accumulated_percentage
        FROM airdrop_recipients ar
        LEFT JOIN wallet_token_states wts ON ar.wallet_id = wts.wallet_id AND ar.token_id = wts.token_id
        WHERE ar.token_id = $1;
      `;

      const result = await this.pool.query(query, [tokenId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error getting token analytics:', error);
      throw error;
    }
  }

  /**
   * Get top sellers
   */
  async getTopSellers(tokenId, limit = 20) {
    try {
      const query = `
        SELECT 
          w.address,
          ar.amount_received as airdrop_amount,
          wts.total_sold as tokens_sold,
          se.timestamp as first_sale_time
        FROM airdrop_recipients ar
        JOIN wallets w ON ar.wallet_id = w.id
        JOIN wallet_token_states wts ON ar.wallet_id = wts.wallet_id AND ar.token_id = wts.token_id
        LEFT JOIN swap_events se ON ar.wallet_id = se.wallet_id AND ar.token_id = se.token_id
        WHERE ar.token_id = $1 AND wts.behavior_status = 'SOLD'
        ORDER BY wts.total_sold DESC
        LIMIT $2;
      `;

      const result = await this.pool.query(query, [tokenId, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting top sellers:', error);
      throw error;
    }
  }

  /**
   * Get diamond hands (holders)
   */
 async getDiamondHands(tokenId, limit = 20) {
    try {
      const query = `
        SELECT 
          w.address,
          ar.amount_received,
          wts.current_balance,
          ar.received_at,
          EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ar.received_at))::int as days_holding
        FROM airdrop_recipients ar
        JOIN wallets w ON ar.wallet_id = w.id
        JOIN wallet_token_states wts ON ar.wallet_id = wts.wallet_id AND ar.token_id = wts.token_id
        WHERE ar.token_id = $1 AND wts.behavior_status = 'HELD'
        ORDER BY days_holding DESC
        LIMIT $2;
      `;

      const result = await this.pool.query(query, [tokenId, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting diamond hands:', error);
      throw error;
    }
  }

  /**
   * Search wallet
   */
  async searchWallet(address) {
    try {
      const query = `
        SELECT 
          w.id,
          w.address,
          COUNT(DISTINCT ar.token_id) as airdrops_received
        FROM wallets w
        LEFT JOIN airdrop_recipients ar ON w.id = ar.wallet_id
        WHERE w.address ILIKE $1
        GROUP BY w.id, w.address
        LIMIT 10;
      `;

      const result = await this.pool.query(query, [`%${address}%`]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error searching wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet details with all airdrops
   */
  async getWalletDetails(walletAddress) {
    try {
      const query = `
        SELECT 
          w.address,
          w.created_at as first_seen_at,
          COUNT(ar.id) as total_airdrops,
          array_agg(DISTINCT ar.token_id) as token_ids
        FROM wallets w
        LEFT JOIN airdrop_recipients ar ON w.id = ar.wallet_id
        WHERE w.address = $1
        GROUP BY w.address, w.created_at;
      `;

      const result = await this.pool.query(query, [walletAddress]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting wallet details:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = DatabaseService;
