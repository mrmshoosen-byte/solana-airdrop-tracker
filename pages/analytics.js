import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data/analytics');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data);
      } else {
        setError('No data available');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = analytics?.analytics || {};

  const chartData = [
    {
      name: 'Sold',
      count: stats.sold_count || 0,
      percentage: Math.round(stats.sold_percentage || 0),
      color: '#ef4444'
    },
    {
      name: 'Held',
      count: stats.held_count || 0,
      percentage: Math.round(stats.held_percentage || 0),
      color: '#3b82f6'
    },
    {
      name: 'Accumulated',
      count: stats.accumulated_count || 0,
      percentage: Math.round(stats.accumulated_percentage || 0),
      color: '#10b981'
    }
  ];

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
            <Link href="/analytics" className="text-white hover:text-blue-400 transition">Analytics</Link>
            <Link href="/search" className="text-gray-400 hover:text-white transition">Search</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-4xl font-bold text-white mb-2">Detailed Analytics</h2>
          <p className="text-gray-400">In-depth analysis of airdrop recipient behavior</p>
        </div>
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

        {analytics && !loading && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <p className="text-gray-400 text-sm mb-2">Total Recipients</p>
                <p className="text-4xl font-bold text-white">{stats.total_recipients || 0}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <p className="text-gray-400 text-sm mb-2">Sold %</p>
                <p className="text-4xl font-bold text-red-400">{Math.round(stats.sold_percentage || 0)}%</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <p className="text-gray-400 text-sm mb-2">Held %</p>
                <p className="text-4xl font-bold text-blue-400">{Math.round(stats.held_percentage || 0)}%</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <p className="text-gray-400 text-sm mb-2">Accumulated %</p>
                <p className="text-4xl font-bold text-green-400">{Math.round(stats.accumulated_percentage || 0)}%</p>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Bar Chart */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <h3 className="text-lg font-bold text-white mb-6">Wallet Count by Behavior</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Pie Chart */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <h3 className="text-lg font-bold text-white mb-6">Distribution %</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="percentage"
                    >
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Top Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Sellers */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <h3 className="text-lg font-bold text-white mb-4">🔴 Top 15 Sellers</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analytics.topSellers?.slice(0, 15).map((seller, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500 transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-mono truncate">{seller.address}</p>
                        <p className="text-xs text-gray-400">
                          {(seller.tokens_sold / 1e6).toFixed(0)} tokens • {(seller.airdrop_amount / 1e6).toFixed(2)} airdrop
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-red-400 text-sm font-bold">#{idx + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Diamond Hands */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <h3 className="text-lg font-bold text-white mb-4">💎 Top 15 Diamond Hands</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analytics.diamondHands?.slice(0, 15).map((holder, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500 transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-mono truncate">{holder.address}</p>
                        <p className="text-xs text-gray-400">
                          Balance: {(holder.current_balance / 1e6).toFixed(0)} • {holder.days_holding}d holding
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-blue-400 text-sm font-bold">#{idx + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Statistics Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
            >
              <h3 className="text-lg font-bold text-white mb-6">Summary Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="text-gray-400 text-sm mb-1">Paper Hands</p>
                  <p className="text-2xl font-bold text-red-400">{stats.sold_count || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(stats.sold_percentage || 0)}% fully exited</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-gray-400 text-sm mb-1">Diamond Hands</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.held_count || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(stats.held_percentage || 0)}% still holding</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-gray-400 text-sm mb-1">Believers</p>
                  <p className="text-2xl font-bold text-green-400">{stats.accumulated_count || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(stats.accumulated_percentage || 0)}% accumulated more</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
