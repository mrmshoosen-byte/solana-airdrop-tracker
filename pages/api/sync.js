const SolanaService = require('@/lib/solanaService');
const DatabaseService = require('@/lib/databaseService');
const AnalyticsService = require('@/lib/analyticsService');

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const TOKEN_MINT = process.env.TOKEN_MINT || '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Starting sync...');
    console.log('TOKEN_MINT:', TOKEN_MINT);
    console.log('HELIUS_API_KEY exists:', !!HELIUS_API_KEY);
    console.log('HELIUS_API_KEY starts with:', HELIUS_API_KEY?.substring(0, 10));

    if (!HELIUS_API_KEY) {
      console.error('❌ HELIUS_API_KEY not set');
      return res.status(400).json({ error: 'HELIUS_API_KEY not configured in environment' });
    }

    if (!TOKEN_MINT) {
      console.error('❌ TOKEN_MINT not set');
      return res.status(400).json({ error: 'TOKEN_MINT not configured' });
    }

    console.log('📡 Creating Solana service...');
    const solana = new SolanaService(HELIUS_API_KEY);

    console.log('📦 Fetching token metadata...');
    const tokenMetadata = await solana.getTokenMetadata(TOKEN_MINT);
    
    console.log('Token metadata result:', tokenMetadata);

    if (!tokenMetadata) {
      console.error('❌ Token metadata is null');
      return res.status(400).json({ error: 'Token not found on Solana - verify TOKEN_MINT is correct' });
    }

    console.log('✅ Token found:', tokenMetadata);

    const db = new DatabaseService();
    const tokenId = await db.upsertToken(TOKEN_MINT, tokenMetadata);
    console.log(`✅ Token stored with ID: ${tokenId}`);

    console.log('👥 Fetching airdrop recipients...');
    const recipients = await solana.getAirdropRecipients(TOKEN_MINT);
    console.log(`✅ Found ${recipients.length} recipients`);

    if (recipients.length === 0) {
      await db.close();
      return res.status(400).json({ error: 'No airdrop recipients found' });
    }

    let processed = 0;
    for (const recipient of recipients.slice(0, 100)) {
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
        if (processed % 20 === 0) {
          console.log(`⏳ Processed ${processed} wallets...`);
        }
      } catch (error) {
        console.warn(`⚠️ Error processing wallet: ${error.message}`);
      }
    }

    console.log('📊 Calculating analytics...');
    const analytics = await db.getTokenAnalytics(tokenId);
    let topSellers = [];
    let diamondHands = [];

    try {
      topSellers = await db.getTopSellers(tokenId, 10);
    } catch (error) {
      console.warn('⚠️ Error getting top sellers:', error.message);
    }

    try {
      diamondHands = await db.getDiamondHands(tokenId, 10);
    } catch (error) {
      console.warn('⚠️ Error getting diamond hands:', error.message);
    }

    await db.close();

    console.log('✅ Sync complete!');

    return res.status(200).json({
      success: true,
      message: 'Sync completed successfully',
      data: {
        token: {
          mint: TOKEN_MINT,
          decimals: tokenMetadata.decimals,
          totalSupply: tokenMetadata.totalSupply
        },
        summary: {
          totalRecipients: recipients.length,
          processedWallets: processed,
          total_recipients: recipients.length,
          sold_count: 0,
          held_count: processed,
          accumulated_count: 0,
          sold_percentage: 0,
          held_percentage: 100,
          accumulated_percentage: 0
        },
        topSellers: topSellers || [],
        diamondHands: diamondHands || []
      }
    });
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return res.status(500).json({ 
      error: 'Sync failed',
      details: error.message
    });
  }
}