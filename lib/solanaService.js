class SolanaService {
  constructor(heliusApiKey) {
    this.heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
  }

  async getAirdropRecipients(tokenMint) {
    try {
      console.log(`📡 Fetching airdrop recipients for token: ${tokenMint}`);
      
      const response = await fetch(this.heliusRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'token-largest',
          method: 'getTokenLargestAccounts',
          params: [tokenMint]
        })
      });

      const data = await response.json();
      if (data.result?.value) {
        return data.result.value.slice(0, 100).map(acc => ({
          address: acc.address,
          currentBalance: acc.uiAmount || 0
        }));
      }
      return [];
    } catch (error) {
      console.error('Error:', error);
      return [];
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

  async getTokenMetadata(tokenMint) {
    try {
      const response = await fetch(this.heliusRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'token-supply',
          method: 'getTokenSupply',
          params: [tokenMint]
        })
      });

      const data = await response.json();
      if (data.result) {
        return {
          mint: tokenMint,
          decimals: data.result.value.decimals || 6,
          totalSupply: data.result.value.uiAmount || 0
        };
      }
    } catch (error) {
      console.error('Error:', error);
    }
    return null;
  }
}

module.exports = SolanaService;