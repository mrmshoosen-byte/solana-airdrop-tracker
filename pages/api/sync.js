import SolanaService from '@/lib/solanaService';
import DatabaseService from '@/lib/databaseService';
import AnalyticsService from '@/lib/analyticsService';

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
    const db = new DatabaseService();
    const solana = new SolanaService(HELIUS_API_KEY);

    console.log('🔄 Starting sync process...');

    // Step 1: Get token metadata
    console.log('📦 Fetching token metadata...');
    const tokenMetadata = await solana.getTokenMetadata(TOKEN_MINT);
    if (!tokenMetadata) {
      await db.close();
      return res.status(400).json({ error: 'Token not found on Solana' });
    }

    // Store token
    const tokenId = await db.upsertToken(TOKEN_MINT, tokenMetadata);
    console.log(`✅ Token stored with ID: ${tokenId}`);

    // Step 2: Get airdrop recipients
    console.log('👥 Fetching airdrop recipients...');
    const recipients = await solana.getAirdropRecipients(TOKEN_MINT);
    
    if (recipients.length === 0) {
      await db.close();
      return res.status(400).json({ error: 'No airdrop recipients found' });
    }

    console.log(`✅ Found ${recipients.length} recipients`);

    // Step 3: Store recipients and analyze behavior
    let processed = 0;
    const walletStates = [];

    for (const recipient of recipients) {
      try {
        // Store wallet
        const walletId = await db.upsertWallet(recipient.address);

        // Get current balance
        const balanceInfo = await solana.getWalletTokenBalance(recipient.address, TOKEN_MINT);

        // Get wallet transactions to detect swaps
        const transactions = await solana.getWalletTransactions(recipient.address, TOKEN_MINT);
        
        // Initialize state
        let totalSold = 0;
        let totalBought = 0;

        // Check for swap events
        for (const tx of transactions) {
          const swaps = await solana.detectSwapEvents(tx.signature);
          if (swaps.length > 0) {
            // Mark as potential seller
            for (const swap of swaps) {
              await db.storeSwapEvent(walletId, tokenId, recipient.currentBalance || 0, tx.signature, tx.slot, tx.blockTime || Date.now() / 1000, swap.dex);
              totalSold += recipient.currentBalance || 0;
            }
          }
        }

        // Classify behavior
        const behavior = AnalyticsService.classifyWalletBehavior(
          recipient.currentBalance * Math.pow(10, tokenMetadata.decimals),
          balanceInfo.rawBalance,
          totalSold,
          totalBought
        );

        // Store wallet state
        const stateId = await db.updateWalletTokenState(walletId, tokenId, {
          currentBalance: balanceInfo.rawBalance,
          originalAirdropAmount: recipient.currentBalance * Math.pow(10, tokenMetadata.decimals),
          totalBought,
          totalSold,
          behaviorStatus: behavior
        });

        walletStates.push({
          walletId,
          address: recipient.address,
          behavior,
          balance: balanceInfo.balance
        });

        processed++;
        if (processed % 50 === 0) {
          console.log(`⏳ Processed ${processed}/${recipients.length} wallets...`);
        }
      } catch (error) {
        console.warn(`⚠️  Error processing wallet ${recipient.address}:`, error.message);
      }
    }

    // Step 4: Calculate analytics
    console.log('📊 Calculating analytics...');
    const analytics = await db.getTokenAnalytics(tokenId);
    const topSellers = await db.getTopSellers(tokenId, 20);
    const diamondHands = await db.getDiamondHands(tokenId, 20);

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
          ...analytics
        },
        segments: AnalyticsService.getBehavioralSegments(analytics || {}),
        topSellers: topSellers.slice(0, 10),
        diamondHands: diamondHands.slice(0, 10)
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
