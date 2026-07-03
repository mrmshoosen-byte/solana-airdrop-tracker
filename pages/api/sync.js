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

    if (!HELIUS_API_KEY) {
      return res.status(400).json({ error: 'HELIUS_API_KEY not configured' });
    }

    console.log('📡 Creating Solana service...');
    const solana = new SolanaService(HELIUS_API_KEY);

    console.log('📦 Fetching token metadata...');
    const tokenMetadata = await solana.getTokenMetadata(TOKEN_MINT);
    
    console.log('Token metadata:', tokenMetadata);

    if (!tokenMetadata) {
      return res.status(400).json({ error: 'Token not found on Solana' });
    }

    console.log('✅ Token found');

    const db = new DatabaseService();
    const tokenId = await db.upsertToken(TOKEN_MINT, tokenMetadata);
    console.log(`✅ Token stored with ID: ${tokenId}`);

    console.log('👥 Checking for existing recipients...');
    const existingRecipients = await db.getAirdropRecipients(tokenId);
    console.log(`✅ Found ${existingRecipients.length} recipients in database`);

    let recipients = [];
    let processed = 0;

    if (existingRecipients.length === 0) {
      console.log('📡 No recipients found, fetching from blockchain...');
      recipients = await solana.getAirdropRecipients(TOKEN_MINT);
      console.log(`✅ Found ${recipients.length} recipients from blockchain`);

      if (recipients.length === 0) {
        await db.close();
        return res.status(400).json({ error: 'No airdrop recipients found' });
      }

      // Process blockchain recipients
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        try {
          const walletId = await db.upsertWallet(recipient.address);
          const currentBalance = (recipient.currentBalance || 0) * Math.pow(10, tokenMetadata.decimals);

          const behavior = AnalyticsService.classifyWalletBehavior(
            currentBalance,
            currentBalance,
            0,
            0
          );

          await db.storeAirdropRecipient(
            tokenId,
            walletId,
            currentBalance,
            new Date(),
            'airdrop'
          );

          await db.updateWalletTokenState(walletId, tokenId, {
            currentBalance: currentBalance.toString(),
            originalAirdropAmount: currentBalance,
            totalBought: 0,
            totalSold: 0,
            behaviorStatus: behavior
          });

          processed++;
          if (processed % 20 === 0) {
            console.log(`⏳ Processed ${processed} wallets...`);
          }
        } catch (error) {
          console.error(`❌ Error processing wallet: ${error.message}`);
        }
      }
    } else {
      console.log(`✅ Using ${existingRecipients.length} recipients from CSV import`);
      recipients = existingRecipients;
      processed = existingRecipients.length;
    }

    console.log(`\n✅ Successfully processed ${processed}/${recipients.length} wallets`);

    console.log('📊 Calculating analytics...');
    const analytics = await db.getTokenAnalytics(tokenId);
    
    let topSellers = [];
    let diamondHands = [];

    try {
      topSellers = await db.getTopSellers(tokenId, 20);
      console.log(`✅ Found ${topSellers.length} top sellers`);
    } catch (error) {
      console.warn('⚠️ Warning getting top sellers:', error.message);
    }

    try {
      diamondHands = await db.getDiamondHands(tokenId, 20);
      console.log(`✅ Found ${diamondHands.length} diamond hands`);
    } catch (error) {
      console.warn('⚠️ Warning getting diamond hands:', error.message);
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
          sold_count: analytics?.sold_count || 0,
          held_count: analytics?.held_count || processed,
          accumulated_count: analytics?.accumulated_count || 0,
          sold_percentage: analytics?.sold_percentage || 0,
          held_percentage: analytics?.held_percentage || 100,
          accumulated_percentage: analytics?.accumulated_percentage || 0
        },
        segments: {
          paperhands: { 
            count: analytics?.sold_count || 0, 
            percentage: analytics?.sold_percentage || 0,
            description: 'Wallets that fully exited position'
          },
          diamondHands: { 
            count: analytics?.held_count || processed, 
            percentage: analytics?.held_percentage || 100,
            description: 'Wallets still holding original airdrop'
          },
          believers: { 
            count: analytics?.accumulated_count || 0, 
            percentage: analytics?.accumulated_percentage || 0,
            description: 'Wallets that bought more after airdrop'
          }
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