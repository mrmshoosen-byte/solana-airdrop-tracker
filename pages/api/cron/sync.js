export default async function handler(req, res) {
  try {
    // Verify cron secret
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔄 Auto-sync started at:', new Date().toISOString());

    // Call the main sync endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    const syncResponse = await fetch(`${baseUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const syncData = await syncResponse.json();

    console.log('✅ Auto-sync completed:', syncData.message);

    return res.status(200).json({
      success: true,
      message: 'Auto-sync completed',
      timestamp: new Date().toISOString(),
      syncResult: syncData.message
    });
  } catch (error) {
    console.error('❌ Auto-sync failed:', error);
    return res.status(500).json({
      error: 'Auto-sync failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}