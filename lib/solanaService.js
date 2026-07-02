class SolanaService {
  constructor(heliusApiKey) {
    this.heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
  }

  async getAirdropRecipients(tokenMint) {
    try {
      console.log(`📡 Fetching airdrop recipients for: ${tokenMint}`);
      const response = await fetch(this.heliusRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'largest-accounts',
          method: 'getTokenLargestAccounts',
          params: [tokenMint]
        })
      });

      const data = await response.json();
      if (data.result?.value) {
        return data.result.value.map(acc => ({
          address: acc.address,
          currentBalance: acc.uiAmount || 0,
          amount: acc.amount || '0'
        }));
      }
      return [];
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
      console.log('Token supply response:', data);
      
      if (data.result?.value) {
        return {
          mint: tokenMint,
          decimals: data.result.value.decimals || 6,
          totalSupply: data.result.value.uiAmount || 0,
          totalSupplyRaw: data.result.value.amount || '0'
        };
      }
      
      if (data.error) {
        console.error('RPC Error:', data.error);
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