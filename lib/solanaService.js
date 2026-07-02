class SolanaService {
  constructor(heliusApiKey) {
    this.heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
  }

  async getAirdropRecipients(tokenMint) {
    try {
      console.log(`📡 Fetching ALL airdrop recipients for: ${tokenMint}`);
      
      const recipients = new Map();
      let before = null;
      let pageCount = 0;
      const maxPages = 50; // Fetch up to 50 pages

      // Fetch all token accounts (paginated)
      while (pageCount < maxPages) {
        const params = [tokenMint];
        if (before) params.push({ before, limit: 100 });
        else params.push({ limit: 100 });

        const response = await fetch(this.heliusRpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: `largest-accounts-${pageCount}`,
            method: 'getTokenLargestAccounts',
            params
          })
        });

        const data = await response.json();
        
        if (!data.result?.value || data.result.value.length === 0) {
          console.log(`✅ Fetched ${recipients.size} total recipients`);
          break;
        }

        // Add all accounts from this page
        for (const acc of data.result.value) {
          if (acc.uiAmount > 0) {
            recipients.set(acc.address, {
              address: acc.address,
              currentBalance: acc.uiAmount || 0,
              amount: acc.amount || '0'
            });
          }
        }

        console.log(`⏳ Page ${pageCount + 1}: Found ${data.result.value.length} accounts (total: ${recipients.size})`);

        // Set cursor for next page
        before = data.result.value[data.result.value.length - 1]?.address;
        pageCount++;

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Total recipients found: ${recipients.size}`);
      return Array.from(recipients.values());
    } catch (error) {
      console.error('Error fetching recipients:', error);
      return [];
    }
  }

  async getTokenMetadata(tokenMint) {
    try {
      console.log(`📦 Fetching metadata for: ${tokenMint}`);
      const response = await fetch(this.heliusRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'supply',
          method: 'getTokenSupply',
          params: [tokenMint]
        })
      });

      const data = await response.json();
      
      if (data.result?.value) {
        return {
          mint: tokenMint,
          decimals: data.result.value.decimals || 6,
          totalSupply: data.result.value.uiAmount || 0,
          totalSupplyRaw: data.result.value.amount || '0'
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  async getWalletTokenBalance(walletAddress, tokenMint) {
    return { balance: 0, rawBalance: '0', decimals: 6 };
  }

  async getWalletTransactions(walletAddress) {
    return [];
  }

  async detectSwapEvents(txHash) {
    return [];
  }
}

module.exports = SolanaService;