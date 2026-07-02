class SolanaService {
  constructor(heliusApiKey) {
    this.heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
  }

  async getAirdropRecipients(tokenMint) {
    try {
      console.log(`📡 Fetching ALL airdrop transactions from sender...`);
      
      const senderWallet = 'GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52';
      const recipients = new Map();
      let before = null;
      let pageCount = 0;
      let transactionsParsed = 0;

      // Fetch ALL pages of transactions (no limit)
      while (true) {
        console.log(`\n⏳ Page ${pageCount + 1}: Fetching signatures...`);

        const params = [senderWallet];
        const options = { limit: 1000 };
        if (before) options.before = before;
        params.push(options);

        const response = await fetch(this.heliusRpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: `sigs-${pageCount}`,
            method: 'getSignaturesForAddress',
            params
          })
        });

        const data = await response.json();
        
        if (!data.result || data.result.length === 0) {
          console.log(`\n✅ Reached end of transaction history`);
          break;
        }

        console.log(`📜 Page ${pageCount + 1}: Got ${data.result.length} signatures`);

        // Parse EVERY transaction
        for (const sig of data.result) {
          try {
            const txData = await fetch(this.heliusRpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: `tx-${sig.signature}`,
                method: 'getTransaction',
                params: [sig.signature, { maxSupportedTransactionVersion: 0 }]
              })
            });

            const result = await txData.json();
            
            if (result.result?.meta?.postTokenBalances) {
              // Look for ALL token balance changes for this mint
              for (const balance of result.result.meta.postTokenBalances) {
                if (balance.mint === tokenMint && balance.uiTokenAmount.uiAmount > 0) {
                  const owner = balance.owner;
                  
                  // Store recipient with their balance
                  if (!recipients.has(owner)) {
                    recipients.set(owner, {
                      address: owner,
                      currentBalance: balance.uiTokenAmount.uiAmount
                    });
                    console.log(`✅ Recipient #${recipients.size}: ${owner.substring(0, 6)}...`);
                  }
                }
              }
            }

            transactionsParsed++;
          } catch (e) {
            // Continue on error
          }

          // Minimal delay
          await new Promise(r => setTimeout(r, 20));
        }

        // Move to next page
        before = data.result[data.result.length - 1]?.signature;
        pageCount++;

        console.log(`📊 Progress: Page ${pageCount}, ${recipients.size} recipients found, ${transactionsParsed} TXs parsed`);
      }

      console.log(`\n✅ FINAL: Found ${recipients.size} recipients from ${transactionsParsed} transactions`);
      return Array.from(recipients.values());
    } catch (error) {
      console.error('Error:', error);
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