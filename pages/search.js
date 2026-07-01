import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletDetails, setWalletDetails] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/data/wallet-search?address=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWallet = async (address) => {
    try {
      setSelectedWallet(address);
      const response = await fetch(`/api/data/wallet-airdrop-status?address=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data.success) {
        setWalletDetails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SOLD':
        return 'text-red-400 bg-red-900/20';
      case 'HELD':
        return 'text-blue-400 bg-blue-900/20';
      case 'ACCUMULATED':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-gray-400 bg-slate-700/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SOLD':
        return '🔴 Paper Hands';
      case 'HELD':
        return '💎 Diamond Hands';
      case 'ACCUMULATED':
        return '🚀 Believer';
      default:
        return '❓ Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
            <h1 className="text-2xl font-bold text-white">Airdrop Tracker</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
            <Link href="/recipients" className="text-gray-400 hover:text-white transition">Recipients</Link>
            <Link href="/analytics" className="text-gray-400 hover:text-white transition">Analytics</Link>
            <Link href="/search" className="text-white hover:text-blue-400 transition">Search</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800/50 to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-4xl font-bold text-white mb-2">Wallet Search</h2>
          <p className="text-gray-400">Find any wallet and analyze their airdrop behavior</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.form 
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter wallet address (0x... or base58...)"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg transition font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </motion.form>

        {/* Search Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-white mb-4">Results</h3>
              
              {results.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.map((result, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelectWallet(result.address)}
                      whileHover={{ scale: 1.02 }}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedWallet === result.address
                          ? 'bg-blue-900/30 border-blue-500'
                          : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <p className="text-white text-sm font-mono truncate">{result.address}</p>
                      <p className="text-xs text-gray-400">{result.airdropsReceived || 0} airdrops</p>
                    </motion.button>
                  ))}
                </div>
              ) : searchQuery && !loading ? (
                <p className="text-gray-400 text-sm">No wallets found</p>
              ) : (
                <p className="text-gray-500 text-sm">Enter an address to search</p>
              )}
            </div>
          </motion.div>

          {/* Wallet Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {walletDetails ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Wallet Address</p>
                  <p className="text-white font-mono text-sm break-all">{walletDetails.walletAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <p className="text-gray-400 text-sm mb-2">Status</p>
                    <p className={`text-lg font-bold ${getStatusColor(walletDetails.status)}`}>
                      {getStatusLabel(walletDetails.status)}
                    </p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <p className="text-gray-400 text-sm mb-2">Current Balance</p>
                    <p className="text-lg font-bold text-white">{(walletDetails.currentBalance / 1e6).toFixed(2)}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <p className="text-gray-400 text-sm mb-2">Airdrop Amount</p>
                    <p className="text-lg font-bold text-blue-400">{(walletDetails.originalAirdropAmount / 1e6).toFixed(2)}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <p className="text-gray-400 text-sm mb-2">Total Sold</p>
                    <p className="text-lg font-bold text-red-400">{(walletDetails.totalSold / 1e6).toFixed(2)}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <p className="text-gray-400 text-sm mb-2">Total Bought</p>
                    <p className="text-lg font-bold text-green-400">{(walletDetails.totalBought / 1e6).toFixed(2)}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <p className="text-gray-400 text-sm mb-2">Last Update</p>
                    <p className="text-sm text-white">{walletDetails.lastUpdate ? new Date(walletDetails.lastUpdate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-slate-700/20 border border-slate-600 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-3">Activity Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">
                      <span className="text-white font-medium">Behavior:</span> {getStatusLabel(walletDetails.status)}
                    </p>
                    {walletDetails.currentBalance === 0 && walletDetails.totalSold > 0 && (
                      <p className="text-red-400">Wallet has completely exited the position</p>
                    )}
                    {walletDetails.currentBalance > 0 && walletDetails.totalSold === 0 && (
                      <p className="text-blue-400">Wallet is holding original airdrop amount</p>
                    )}
                    {walletDetails.totalBought > 0 && (
                      <p className="text-green-400">Wallet has accumulated additional tokens</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur text-center">
                <p className="text-gray-400">Select a wallet to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
