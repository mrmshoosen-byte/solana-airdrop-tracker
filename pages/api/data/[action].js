import DatabaseService from '@/lib/databaseService';

export default async function handler(req, res) {
  const { action } = req.query;
  const db = new DatabaseService();

  try {
    const TOKEN_MINT = process.env.TOKEN_MINT || '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';

    // Get token ID from database
    const token = await db.getTokenByMint(TOKEN_MINT);
    if (!token) {
      return res.status(404).json({ error: 'Token not found. Run sync first.' });
    }

    switch (action) {
      case 'analytics': {
        // Get overall analytics
        const analytics = await db.getTokenAnalytics(token.id);
        const topSellers = await db.getTopSellers(token.id, 15);
        const diamondHands = await db.getDiamondHands(token.id, 15);

        return res.status(200).json({
          success: true,
          analytics,
          topSellers: topSellers.map(s => ({
            ...s,
            airdropAmount: s.airdrop_amount,
            tokensSold: s.tokens_sold,
            firstSaleTime: s.first_sale_time
          })),
          diamondHands: diamondHands.map(d => ({
            ...d,
            airdropAmount: d.amount_received,
            currentBalance: d.current_balance,
            receivedAt: d.received_at,
            daysHolding: d.days_holding
          }))
        });
      }

      case 'recipients': {
        const { limit = 100, offset = 0 } = req.query;
        const recipients = await db.getAirdropRecipients(token.id, limit);
        
        return res.status(200).json({
          success: true,
          recipients: recipients.map(r => ({
            ...r,
            airdropAmount: r.amount_received,
            currentBalance: r.current_balance,
            receivedAt: r.received_at
          }))
        });
      }

      case 'wallet-search': {
        const { address } = req.query;
        if (!address) {
          return res.status(400).json({ error: 'Address parameter required' });
        }

        const results = await db.searchWallet(address);
        
        return res.status(200).json({
          success: true,
          results: results.map(r => ({
            address: r.address,
            airdropsReceived: r.airdrops_received
          }))
        });
      }

      case 'wallet-details': {
        const { address } = req.query;
        if (!address) {
          return res.status(400).json({ error: 'Address parameter required' });
        }

        const details = await db.getWalletDetails(address);
        if (!details) {
          return res.status(404).json({ error: 'Wallet not found' });
        }

        return res.status(200).json({
          success: true,
          wallet: {
            address: details.address,
            firstSeen: details.first_seen_at,
            totalAirdrops: details.total_airdrops,
            tokens: details.token_ids
          }
        });
      }

      case 'wallet-airdrop-status': {
        const { address } = req.query;
        if (!address) {
          return res.status(400).json({ error: 'Address parameter required' });
        }

        const wallet = await db.getWalletByAddress(address);
        if (!wallet) {
          return res.status(404).json({ error: 'Wallet not found' });
        }

        const state = await db.getWalletTokenState(wallet.id, token.id);
        
        return res.status(200).json({
          success: true,
          walletAddress: address,
          status: state?.behavior_status || 'UNKNOWN',
          currentBalance: state?.current_balance || 0,
          originalAirdropAmount: state?.original_airdrop_amount || 0,
          totalSold: state?.total_sold || 0,
          totalBought: state?.total_bought || 0,
          lastUpdate: state?.updated_at
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  } finally {
    await db.close();
  }
}
