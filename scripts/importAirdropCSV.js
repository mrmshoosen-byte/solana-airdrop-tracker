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
      console.error('❌ Token not found. Run sync first.');
      process.exit(1);
    }
    const tokenId = token.id;
    console.log(`✅ Using token ID: ${tokenId}`);

    console.log(`📖 Reading CSV: ${CSV_FILE}`);
    const csv = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csv.trim().split('\n');

    console.log(`📊 Found ${lines.length} recipients`);

    let imported = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',');
      
      // Column 4 is wallet, Column 6 is the amount in raw units
      const walletAddress = parts[4] ? parts[4].trim() : null;
      const amountRaw = Math.floor(parseFloat(parts[6]) || 0); // Use column 6, convert to integer
      const timestamp = parts[2] ? new Date(parts[2]) : new Date();

      if (!walletAddress || walletAddress.length !== 44) {
        console.warn(`⚠️ Skipping invalid wallet: ${walletAddress}`);
        continue;
      }

      try {
        const walletId = await db.upsertWallet(walletAddress);

        await db.storeAirdropRecipient(
          tokenId,
          walletId,
          amountRaw,
          timestamp,
          'csv-import'
        );

        await db.updateWalletTokenState(walletId, tokenId, {
          currentBalance: amountRaw.toString(),
          originalAirdropAmount: amountRaw,
          totalBought: 0,
          totalSold: 0,
          behaviorStatus: 'HELD'
        });

        imported++;
        if (imported % 100 === 0) {
          console.log(`⏳ Imported ${imported}/${lines.length}...`);
        }
      } catch (error) {
        console.warn(`⚠️ Error importing ${walletAddress}: ${error.message}`);
      }
    }

    console.log(`\n✅ Imported ${imported}/${lines.length} recipients`);
    await db.close();
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

importCSV();