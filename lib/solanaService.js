class SolanaService {
  constructor(heliusApiKey) {
    this.heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
  }

  async getAirdropRecipients(tokenMint) {
    try {
      console.log(`📡 Fetching airdrop recipients from sender wallet...`);
      
      const senderWallet = 'GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52';
      const recipients = new Map();

      // Get all transactions from sender wallet
      const response = await fetch(this.heliusRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'wallet-txs',
          method: 'getSignaturesForAddress',
          params: [senderWallet, { limit: 1000 }]
        })
      });

      const data = await response.json();
      
      if (!data.result) {
        console.log('No transactions found');
        return [];
      }

      console.log(`📜 Found ${data.result.length} transactions, parsing for ${tokenMint}...`);

      // Parse each transaction looking for token transfers
      for (const tx of data.result.slice(0, 500)) {
        try {
          const txData = await fetch(this.heliusRpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 'tx-detail',
              method: 'getTransaction',
              params: [tx.signature, { maxSupportedTransactionVersion: 0 }]
            })
          });

          const txDetail = await txData.json();
          
          if (txDetail.result?.meta?.postTokenBalances) {
            // Look for token transfers of our specific token
            for (const balance of txDetail.result.meta.postTokenBalances) {
              if (balance.mint === tokenMint && balance.uiTokenAmount.uiAmount > 0) {
                recipients.set(balance.owner, {
                  address: balance.owner,
                  currentBalance: balance.uiTokenAmount.uiAmount || 0
                });
              }
            }
          }
        } catch (e) {
          // Skip failed transaction parsing
        }
      }

      console.log(`✅ Found ${recipients.size} unique recipients`);
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