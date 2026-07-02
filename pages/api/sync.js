const SolanaService = require('@/lib/solanaService');
const DatabaseService = require('@/lib/databaseService');
const AnalyticsService = require('@/lib/analyticsService');

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const TOKEN_MINT = process.env.TOKEN_MINT || '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!HELIUS_API_KEY) {
    return res.status(400).json({ error: 'HELIUS_API_KEY not configured' });
  }

  try {
    console.log('🔄 Starting sync...');
    
    const db = new DatabaseService();
    const solana = new SolanaService(HELIUS_API_KEY);

    console.log(`📦 Fetching token metadata for: ${TOKEN_MINT}`);
    const tokenMetadata = await solana.getTokenMetadata(TOKEN_MINT);
    
    if (!tokenMetadata) {
      await db.close();
      return res.status(400).json({ error: 'Token not found on Solana' });
    }

    console.log(`✅ Token found: ${JSON.stringify(tokenMetadata)}`);
    
    const tokenId = await db.upsertToken(TOKEN_MINT, tokenMetadata);
    console.log(`✅ Token stored with ID: ${tokenId}`);

    console.log('👥 Fetching airdrop recipients...');
    const recipients = await solana.getAirdropRecipients(TOKEN_MINT);
    
    if (recipients.length === 0) {
      await db.close();
      return res.status(400).json({ error: 'No airdrop recipients found' });
    }

    console.log(`✅ Found ${recipients.length} recipients`);

    let processed = 0;
    for (const recipient of recipients.slice(0, 50)) {
      try {
        const walletId = await db.upsertWallet(recipient.address);
        const balanceInfo = await solana.getWalletTokenBalance(recipient.address, TOKEN_MINT);

        const behavior = AnalyticsService.classifyWalletBehavior(
          recipient.currentBalance * Math.pow(10, tokenMetadata.decimals),
          balanceInfo.rawBalance,
          0,
          0
        );

        await db.updateWalletTokenState(walletId, tokenId, {
          currentBalance: balanceInfo.rawBalance,
          originalAirdropAmount: recipient.currentBalance * Math.pow(10, tokenMetadata.decimals),
          totalBought: 0,
          totalSold: 0,
          behaviorStatus: behavior
        });

        processed++;
      } catch (error) {
        console.warn(`⚠️ Error processing wallet: ${error.message}`);
      }
    }

    const analytics = await db.getTokenAnalytics(tokenId);
    await db.close();

    return res.status(200).json({
      success: true,
      message: 'Sync completed',
      data: {
        token: { mint: TOKEN_MINT, decimals: tokenMetadata.decimals },
        summary: { totalRecipients: recipients.length, processedWallets: processed, ...analytics }
      }
    });
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return res.status(500).json({ error: 'Sync failed', details: error.message });
  }
}