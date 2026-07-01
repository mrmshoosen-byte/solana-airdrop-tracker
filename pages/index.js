import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSyncStatus('Starting sync...');

      const response = await fetch('/api/sync', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setSyncStatus(`✅ Sync complete! Found ${data.data.summary.processedWallets} wallets`);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AT</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Airdrop Tracker</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition text-sm">Dashboard</Link>
              <Link href="/recipients" className="text-gray-400 hover:text-white transition text-sm">Recipients</Link>
              <Link href="/search" className="text-gray-400 hover:text-white transition text-sm">Search</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mb-8"
            >
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-4">
                Solana Airdrop Tracker
              </div>
            </motion.div>

            <p className="text-xl text-gray-400 mb-2">Analyze wallet behavior after airdrop events</p>
            <p className="text-gray-500 mb-12">Track which wallets sold, held, or accumulated more tokens</p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-white font-bold mb-2">Real-time Analytics</h3>
                <p className="text-gray-400 text-sm">Live data from Solana blockchain</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <div className="text-3xl mb-3">💎</div>
                <h3 className="text-white font-bold mb-2">Diamond Hands</h3>
                <p className="text-gray-400 text-sm">Identify long-term believers</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-white font-bold mb-2">Wallet Search</h3>
                <p className="text-gray-400 text-sm">Deep dive into any wallet</p>
              </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>
              <p className="text-gray-400 mb-6">
                Click the button below to sync airdrop data from the Solana blockchain. This will scan all recipients and analyze their behavior.
              </p>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition transform hover:scale-105 active:scale-95"
              >
                {syncing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                    <span>Syncing...</span>
                  </span>
                ) : (
                  '🚀 Start Sync'
                )}
              </button>

              {/* Status Messages */}
              {syncStatus && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 text-sm mt-4"
                >
                  {syncStatus}
                </motion.p>
              )}

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-4"
                >
                  ❌ {error}
                </motion.p>
              )}
            </motion.div>

            {/* Info Box */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 max-w-2xl mx-auto"
            >
              <p className="text-blue-300 text-sm">
                💡 <strong>Note:</strong> Make sure HELIUS_API_KEY and TOKEN_MINT are configured in your .env file. Sync takes time depending on the number of recipients.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-700 bg-slate-800/20 backdrop-blur py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>Solana Airdrop Tracker • Built for analyzing real blockchain data</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
