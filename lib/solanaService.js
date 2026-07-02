class SolanaService {
  constructor(heliusApiKey) {
    this.heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
  }

  async getAirdropRecipients(tokenMint) {
    try {
      console.log(`📡 Fetching airdrop recipients from sender wallet...`);
      
      const senderWallet = 'GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52';
      const recipients = new Map();
      let before = null;
      let pageCount = 0;

      // Get ALL transactions from sender wallet (paginated)
      while (pageCount < 100) {
        console.log(`⏳ Fetching page ${pageCount + 1}...`);

        const params = [senderWallet];
        const options = { limit: 1000 };
        if (before) options.before = before;
        params.push(options);

        const response = await fetch(this.heliusRpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: `wallet-txs-${pageCount}`,
            method: 'getSignaturesForAddress',
            params
          })
        });

        const data = await response.json();
        
        if (!data.result || data.result.length === 0) {
          console.log(`✅ No more transactions. Total recipients found: ${recipients.size}`);
          break;
        }

        console.log(`📜 Page ${pageCount + 1}: Processing ${data.result.length} transactions`);

        // Parse each transaction
        for (const tx of data.result) {
          try {
            const txData = await fetch(this.heliusRpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: `tx-${tx.signature}`,
                method: 'getTransaction',
                params: [tx.signature, { maxSupportedTransactionVersion: 0 }]
              })
            });

            const txDetail = await txData.json();
            
            if (txDetail.result?.meta?.postTokenBalances) {
              // Look for token transfers of our specific token
              for (const balance of txDetail.result.meta.postTokenBalances) {
                if (balance.mint === tokenMint && balance.uiTokenAmount.uiAmount > 0) {
                  const owner = balance.owner;
                  if (!recipients.has(owner)) {
                    recipients.set(owner, {
                      address: owner,
                      currentBalance: balance.uiTokenAmount.uiAmount || 0
                    });
                    console.log(`✅ Found recipient: ${owner.substring(0, 8)}... balance: ${balance.uiTokenAmount.uiAmount}`);
                  }
                }
              }
            }
          } catch (e) {
            // Skip failed transaction parsing
          }

          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        before = data.result[data.result.length - 1]?.signature;
        pageCount++;
      }

      console.log(`✅ Total unique recipients: ${recipients.size}`);
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