class AnalyticsService {
  /**
   * Classify wallet behavior based on token activities
   * Returns: SOLD, HELD, or ACCUMULATED
   */
  static classifyWalletBehavior(airdropAmount, currentBalance, totalSold, totalBought) {
    const decimals = 6; // Standard token decimals
    
    // Normalize amounts for comparison
    const initialAmount = airdropAmount / Math.pow(10, decimals);
    const currentBalanceNormalized = currentBalance / Math.pow(10, decimals);
    const soldNormalized = totalSold / Math.pow(10, decimals);
    const boughtNormalized = totalBought / Math.pow(10, decimals);

    // If wallet has 0 balance and has sold tokens, they SOLD
    if (currentBalanceNormalized === 0 && soldNormalized > 0) {
      return 'SOLD';
    }

    // If wallet still holds original amount (or more), they HELD or ACCUMULATED
    if (currentBalanceNormalized >= initialAmount) {
      if (boughtNormalized > 0) {
        return 'ACCUMULATED';
      }
      return 'HELD';
    }

    // If wallet has partial balance but sold some, they SOLD partially
    if (currentBalanceNormalized > 0 && currentBalanceNormalized < initialAmount && soldNormalized > 0) {
      return 'SOLD';
    }

    // Default classification
    if (currentBalanceNormalized === 0) {
      return 'SOLD';
    }

    if (currentBalanceNormalized >= initialAmount) {
      return boughtNormalized > 0 ? 'ACCUMULATED' : 'HELD';
    }

    return 'HELD';
  }

  /**
   * Calculate time to sell (hours between airdrop and first sale)
   */
  static calculateTimeToSell(airdropTimestamp, firstSaleTimestamp) {
    if (!firstSaleTimestamp) return null;
    
    const airdropTime = new Date(airdropTimestamp).getTime();
    const saleTime = new Date(firstSaleTimestamp).getTime();
    
    const hoursToSell = (saleTime - airdropTime) / (1000 * 60 * 60);
    return Math.max(0, hoursToSell);
  }

  /**
   * Generate distribution statistics
   */
  static generateDistribution(values) {
    if (values.length === 0) return null;

    const sorted = values.sort((a, b) => a - b);
    const n = sorted.length;

    return {
      min: sorted[0],
      max: sorted[n - 1],
      mean: sorted.reduce((a, b) => a + b, 0) / n,
      median: n % 2 === 0 
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
        : sorted[Math.floor(n / 2)],
      p25: sorted[Math.floor(n * 0.25)],
      p75: sorted[Math.floor(n * 0.75)],
      std: this.calculateStdDev(sorted)
    };
  }

  /**
   * Calculate standard deviation
   */
  static calculateStdDev(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Estimate wallet profit/loss
   * Note: Without price data, this is a placeholder
   */
  static estimateProfitLoss(airdropAmount, currentBalance, averageBuyPrice = 0, averageSellPrice = 0) {
    const decimals = 6;
    
    const airdropAmountNorm = airdropAmount / Math.pow(10, decimals);
    const soldAmount = (airdropAmount - currentBalance) / Math.pow(10, decimals);

    const airdropValue = airdropAmountNorm * (averageBuyPrice || 0.0001); // Assume $0.0001 if unknown
    const soldValue = soldAmount * (averageSellPrice || 0.0001);

    return {
      airdropValue,
      soldValue,
      estimatedProfit: soldValue - airdropValue,
      roi: airdropValue > 0 ? ((soldValue - airdropValue) / airdropValue) * 100 : 0
    };
  }

  /**
   * Generate wallet activity summary
   */
  static generateWalletSummary(walletData) {
    return {
      address: walletData.address,
      status: walletData.behavior_status,
      airdropAmount: walletData.amount_received,
      currentBalance: walletData.current_balance,
      totalSold: walletData.total_sold || 0,
      totalBought: walletData.total_bought || 0,
      holdingPeriodDays: this.calculateHoldingPeriod(walletData.received_at),
      lastActivity: walletData.last_activity
    };
  }

  /**
   * Calculate holding period in days
   */
  static calculateHoldingPeriod(airdropDate) {
    if (!airdropDate) return 0;
    const now = new Date();
    const airdrop = new Date(airdropDate);
    const days = (now.getTime() - airdrop.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(days);
  }

  /**
   * Calculate wallet concentration
   * Shows if airdrop recipients are whale-heavy or distributed
   */
  static calculateConcentration(recipients) {
    if (recipients.length === 0) return null;

    const totalAmount = recipients.reduce((sum, r) => sum + r.amount_received, 0);
    const sortedByAmount = recipients.sort((a, b) => b.amount_received - a.amount_received);

    const top10Percent = Math.ceil(recipients.length * 0.1);
    const top10Amount = sortedByAmount
      .slice(0, top10Percent)
      .reduce((sum, r) => sum + r.amount_received, 0);

    const top1Percent = Math.ceil(recipients.length * 0.01);
    const top1Amount = sortedByAmount
      .slice(0, top1Percent)
      .reduce((sum, r) => sum + r.amount_received, 0);

    return {
      herfindahlIndex: this.calculateHerfindahl(recipients),
      top10PercentConcentration: (top10Amount / totalAmount) * 100,
      top1PercentConcentration: (top1Amount / totalAmount) * 100,
      isWhaleHeavy: (top10Amount / totalAmount) > 0.5
    };
  }

  /**
   * Calculate Herfindahl index (0-10000)
   */
  static calculateHerfindahl(recipients) {
    const totalAmount = recipients.reduce((sum, r) => sum + r.amount_received, 0);
    const shares = recipients.map(r => (r.amount_received / totalAmount) * 100);
    const hhi = shares.reduce((sum, share) => sum + Math.pow(share, 2), 0);
    return Math.round(hhi);
  }

  /**
   * Generate time-to-sell distribution buckets
   */
  static generateTimeToSellDistribution(timesToSell) {
    const buckets = {
      '0-1h': 0,
      '1-6h': 0,
      '6-24h': 0,
      '1-7d': 0,
      '7-30d': 0,
      '30d+': 0,
      'notSold': 0
    };

    timesToSell.forEach(hours => {
      if (hours === null) {
        buckets['notSold']++;
      } else if (hours < 1) {
        buckets['0-1h']++;
      } else if (hours < 6) {
        buckets['1-6h']++;
      } else if (hours < 24) {
        buckets['6-24h']++;
      } else if (hours < 24 * 7) {
        buckets['1-7d']++;
      } else if (hours < 24 * 30) {
        buckets['7-30d']++;
      } else {
        buckets['30d+']++;
      }
    });

    return buckets;
  }

  /**
   * Get behavioral segments
   */
  static getBehavioralSegments(analytics) {
    return {
      paperhands: {
        count: analytics.sold_count || 0,
        percentage: analytics.sold_percentage || 0,
        description: 'Wallets that fully exited their position'
      },
      diamondHands: {
        count: analytics.held_count || 0,
        percentage: analytics.held_percentage || 0,
        description: 'Wallets still holding original airdrop'
      },
      believers: {
        count: analytics.accumulated_count || 0,
        percentage: analytics.accumulated_percentage || 0,
        description: 'Wallets that bought more after airdrop'
      }
    };
  }
}

module.exports = AnalyticsService;
