const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');

class SolanaService {
  constructor(heliusApiKey) {
    this.heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    this.connection = new Connection(this.heliusRpc, 'confirmed');
    this.heliusApiKey = heliusApiKey;
  }

  /**
   * Fetch all wallets that received the airdrop token
   * Uses Solana's token supply history and parsed transactions
   */
  async getAirdropRecipients(tokenMint, startSlot = 0) {
    try {
      console.log(`📡 Fetching airdrop recipients for token: ${tokenMint}`);
      
      const recipients = new Map();
      const tokenMintKey = new PublicKey(tokenMint);
      
      // Get token supply info
      const tokenSupply = await this.connection.getTokenSupply(tokenMintKey);
      console.log(`💰 Token decimals: ${tokenSupply.value.decimals}`);

      // Fetch token metadata and largest accounts
      const largestAccounts = await this.connection.getTokenLargestAccounts(tokenMintKey);
      
      // For each token account, get the holder and initial transaction
      for (const account of largestAccounts.value) {
        try {
          const accountInfo = await this.connection.getParsedAccountInfo(account.address);
          
          if (accountInfo.value?.data?.parsed?.info?.owner) {
            const owner = accountInfo.value.data.parsed.info.owner;
            const balance = accountInfo.value.data.parsed.info.tokenAmount.uiAmount;
            
            if (balance > 0) {
              recipients.set(owner, {
                address: owner,
                currentBalance: balance,
                tokenAccount: account.address.toString(),
                lastUpdate: new Date()
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️  Error fetching account info:`, error.message);
        }
      }

      console.log(`✅ Found ${recipients.size} airdrop recipients`);
      return Array.from(recipients.values());
    } catch (error) {
      console.error('❌ Error fetching airdrop recipients:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for a wallet
   * Uses Helius API for better performance
   */
  async getWalletTransactions(walletAddress, tokenMint) {
    try {
      console.log(`📜 Fetching transactions for ${walletAddress}`);

      const response = await fetch(this.heliusRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'wallet-tx',
          method: 'getSignaturesForAddress',
          params: [
            walletAddress,
            { limit: 100 }
          ]
        })
      });

      const data = await response.json();
      
      if (!data.result) {
        console.warn('⚠️  No transactions found');
        return [];
      }

      const transactions = [];
      
      // Fetch detailed transaction data
      for (const sig of data.result.slice(0, 50)) {
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });

          if (tx) {
            transactions.push({
              signature: sig.signature,
              blockTime: tx.blockTime,
              slot: sig.slot,
              err: sig.err,
              memo: sig.memo,
              instructions: tx.transaction.message.instructions.length
            });
          }
        } catch (e) {
          // Transaction may not be available
        }
      }

      return transactions;
    } catch (error) {
      console.error('❌ Error fetching wallet transactions:', error);
      throw error;
    }
  }

  /**
   * Detect swap events from token transfer instructions
   * Identifies when tokens were sold via DEX instructions
   */
  async detectSwapEvents(transactionSignature) {
    try {
      const tx = await this.connection.getTransaction(transactionSignature, {
        maxSupportedTransactionVersion: 0
      });

      if (!tx) return [];

      const swaps = [];
      const tokenProgramId = 'TokenkegQfeZyiNwAJsyFbPVwwQQUq7AtqcqP6scSvk';

      // Look for token transfer instructions that indicate swaps
      for (let i = 0; i < tx.transaction.message.instructions.length; i++) {
        const ix = tx.transaction.message.instructions[i];
        
        // Check for DEX program interactions (Raydium, Orca, Jupiter, etc.)
        const dexPrograms = {
          '675kPX9MHTjS2zt1qrXrQVxwwp4kuh3C5DdVVUC5Lwk': 'Raydium',
          'EchesaKzLh4yXWcWeNfAcKpaua5ZCTqKemo9Kpd79zM': 'Orca',
          'JUP4Fb2cqiRUcaTHdrPhGrsSFEJfdhWBHz3ibEsqjLs': 'Jupiter'
        };

        if (dexPrograms[ix.programId.toString()]) {
          swaps.push({
            transactionSignature,
            programId: ix.programId.toString(),
            dex: dexPrograms[ix.programId.toString()],
            instructionIndex: i,
            blockTime: tx.blockTime
          });
        }
      }

      return swaps;
    } catch (error) {
      console.error('❌ Error detecting swap events:', error);
      return [];
    }
  }

  /**
   * Get current token balance for a wallet
   */
  async getWalletTokenBalance(walletAddress, tokenMint) {
    try {
      const owner = new PublicKey(walletAddress);
      const mint = new PublicKey(tokenMint);

      // Get associated token account
      const ata = await getAssociatedTokenAddress(mint, owner);
      
      const balance = await this.connection.getTokenAccountBalance(ata);
      
      return {
        balance: balance.value.uiAmount,
        rawBalance: balance.value.amount,
        decimals: balance.value.decimals
      };
    } catch (error) {
      // Account doesn't exist or error occurred
      return {
        balance: 0,
        rawBalance: '0',
        decimals: 6
      };
    }
  }

  /**
   * Get all token transfers for a wallet
   */
  async getWalletTokenTransfers(walletAddress, tokenMint) {
    try {
      const response = await fetch(this.heliusRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'token-transfers',
          method: 'getSignaturesForAddress',
          params: [walletAddress, { limit: 100 }]
        })
      });

      const data = await response.json();
      const transfers = [];

      if (data.result) {
        for (const sig of data.result.slice(0, 30)) {
          try {
            const tx = await this.connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            });

            if (tx?.meta?.postTokenBalances) {
              // Filter for our specific token
              const relevantBalances = tx.meta.postTokenBalances.filter(tb => 
                tb.mint === tokenMint
              );

              if (relevantBalances.length > 0) {
                transfers.push({
                  signature: sig.signature,
                  blockTime: tx.blockTime,
                  balances: relevantBalances
                });
              }
            }
          } catch (e) {
            // Skip failed transactions
          }
        }
      }

      return transfers;
    } catch (error) {
      console.error('❌ Error fetching token transfers:', error);
      return [];
    }
  }

  /**
   * Get token info/metadata
   */
  async getTokenMetadata(tokenMint) {
    try {
      const mint = new PublicKey(tokenMint);
      const supply = await this.connection.getTokenSupply(mint);

      return {
        mint: tokenMint,
        decimals: supply.value.decimals,
        totalSupply: supply.value.uiAmount,
        totalSupplyRaw: supply.value.amount
      };
    } catch (error) {
      console.error('❌ Error fetching token metadata:', error);
      return null;
    }
  }
}

module.exports = SolanaService;
