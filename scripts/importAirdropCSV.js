#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const DatabaseService = require('../lib/databaseService');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const TOKEN_MINT = '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';
const CSV_FILE = process.argv[2];

async function importCSV() {
  if (!CSV_FILE) {
    console.error('❌ Usage: node scripts/importAirdropCSV.js airdrop.csv');
    process.exit(1);
  }

  const db = new DatabaseService();

  try {
    console.log('📦 Getting token...');
    const token = await db.getTokenByMint(TOKEN_MINT);
    if (!token) {
      console.error('❌ Token not found.');
      process.exit(1);
    }
    const tokenId = token.id;
    console.log(`✅ Token ID: ${tokenId}`);

    console.log(`📖 Reading CSV: ${CSV_FILE}`);
    const csv = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csv.trim().split('\n');

    console.log(`📊 Found ${lines.length} total rows\n`);

    let imported = 0;
    let skipped = 0;
    
    for (let i = 0; i < lines.length; i++) {
      // Skip header row
      if (i === 0) {
        console.log('⏭️ Skipping header row');
        continue;
      }

      const line = lines[i];
      const parts = line.split(',');
      
      // Column 0 is the recipient wallet address
      const walletAddress = parts[0] ? parts[0].trim() : null;
      // Column 6 is raw amount
      const amountRaw = Math.floor(parseFloat(parts[6]) || 0);
      // Column 2 is timestamp
      const timestamp = parts[2] ? new Date(parts[2]) : new Date();

      if (!walletAddress || walletAddress.length !== 44) {
        skipped++;
        if (i < 10) console.warn(`❌ Row ${i}: Invalid wallet length ${walletAddress?.length}`);
        continue;
      }

      try {
        const walletId = await db.upsertWallet(walletAddress);
        await db.storeAirdropRecipient(tokenId, walletId, amountRaw, timestamp, 'csv-import');
        await db.updateWalletTokenState(walletId, tokenId, {
          currentBalance: amountRaw.toString(),
          originalAirdropAmount: amountRaw,
          totalBought: 0,
          totalSold: 0,
          behaviorStatus: 'HELD'
        });

        imported++;
        if (imported % 200 === 0) console.log(`⏳ ${imported}...`);
      } catch (error) {
        console.warn(`⚠️ Row ${i} error: ${error.message}`);
        skipped++;
      }
    }

    console.log(`\n✅ Imported: ${imported}`);
    console.log(`⚠️ Skipped: ${skipped}`);
    console.log(`📊 Total: ${imported + skipped}`);
    await db.close();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

importCSV();