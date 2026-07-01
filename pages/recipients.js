import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Recipients() {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('amount');

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data/recipients?limit=500');
      const data = await response.json();

      if (data.success) {
        setRecipients(data.recipients || []);
      } else {
        setError('Failed to load recipients');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SOLD':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HELD':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ACCUMULATED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'SOLD':
        return '🔴';
      case 'HELD':
        return '💎';
      case 'ACCUMULATED':
        return '🚀';
      default:
        return '❓';
    }
  };

  const filteredRecipients = recipients
    .filter(r => r.address.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'amount') {
        return (b.airdropAmount || 0) - (a.airdropAmount || 0);
      } else if (sortBy === 'status') {
        return (a.behavior_status || '').localeCompare(b.behavior_status || '');
      }
      return 0;
    });

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
            <Link href="/recipients" className="text-white hover:text-blue-400 transition">Recipients</Link>
            <Link href="/analytics" className="text-gray-400 hover:text-white transition">Analytics</Link>
            <Link href="/search" className="text-gray-400 hover:text-white transition">Search</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-4xl font-bold text-white mb-2">Airdrop Recipients</h2>
          <p className="text-gray-400">Browse all wallets that received the airdrop</p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-b border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="amount">Sort by Airdrop Amount</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
        <p className="text-gray-400 text-sm mt-4">Showing {filteredRecipients.length} recipients</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full"></div>
            </div>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/20 border border-red-500/50 rounded-lg p-6"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {!loading && !error && filteredRecipients.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur overflow-hidden"
          >
            {/* Table Header - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-700 bg-slate-700/30 font-bold text-white text-sm">
              <div className="col-span-6">Wallet Address</div>
              <div className="col-span-2 text-right">Airdrop Amount</div>
              <div className="col-span-2 text-right">Current Balance</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-700">
              {filteredRecipients.map((recipient, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-slate-700/20 transition p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  {/* Address */}
                  <div className="col-span-1 md:col-span-6">
                    <Link href={`/search?wallet=${recipient.address}`}>
                      <a className="text-blue-400 hover:text-blue-300 transition font-mono text-sm break-all">
                        {recipient.address}
                      </a>
                    </Link>
                  </div>

                  {/* Airdrop Amount */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:text-right">
                      <p className="text-white font-bold">
                        {(recipient.airdropAmount / 1e6).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Current Balance */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:text-right">
                      <p className={`font-bold ${
                        (recipient.currentBalance || 0) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(recipient.currentBalance / 1e6).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(recipient.behavior_status)}`}>
                        {getStatusEmoji(recipient.behavior_status)} {recipient.behavior_status || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && filteredRecipients.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-lg"
          >
            <p className="text-gray-400 text-lg">No recipients found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
