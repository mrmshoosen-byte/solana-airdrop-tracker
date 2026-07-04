const DatabaseService = require('@/lib/databaseService');
const AnalyticsService = require('@/lib/analyticsService');

const TOKEN_MINT = process.env.TOKEN_MINT || '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Starting sync...');
    const db = new DatabaseService();

    // Get token
    const token = await db.getTokenByMint(TOKEN_MINT);
    if (!token) {
      return res.status(400).json({ error: 'Token not found' });
    }
    const tokenId = token.id;
    console.log(`✅ Token ID: ${tokenId}`);

    // Get recipients from database (CSV import)
    const recipients = await db.getAirdropRecipients(tokenId, 10000);
    console.log(`✅ Found ${recipients.length} recipients in database`);

    if (recipients.length === 0) {
      await db.close();
      return res.status(400).json({ error: 'No recipients found. Import CSV first.' });
    }

    // Calculate analytics
    console.log('📊 Calculating analytics...');
    const analytics = await db.getTokenAnalytics(tokenId);
    
    let topSellers = [];
    let diamondHands = [];

    try {
      topSellers = await db.getTopSellers(tokenId, 20);
      console.log(`✅ Found ${topSellers.length} top sellers`);
    } catch (error) {
      console.warn('⚠️ Error getting sellers:', error.message);
    }

    try {
      diamondHands = await db.getDiamondHands(tokenId, 20);
      console.log(`✅ Found ${diamondHands.length} diamond hands`);
    } catch (error) {
      console.warn('⚠️ Error getting holders:', error.message);
    }

    await db.close();
    console.log('✅ Sync complete!');

    return res.status(200).json({
      success: true,
      message: 'Sync completed',
      data: {
        token: {
          mint: TOKEN_MINT,
          decimals: token.decimals
        },
        summary: {
          totalRecipients: recipients.length,
          processedWallets: recipients.length,
          total_recipients: recipients.length,
          sold_count: analytics?.sold_count || 0,
          held_count: analytics?.held_count || recipients.length,
          accumulated_count: analytics?.accumulated_count || 0,
          sold_percentage: analytics?.sold_percentage || 0,
          held_percentage: analytics?.held_percentage || 100,
          accumulated_percentage: analytics?.accumulated_percentage || 0
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