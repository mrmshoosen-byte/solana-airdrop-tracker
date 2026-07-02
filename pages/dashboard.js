import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function Dashboard() {
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
        setError('No data available. Please run sync first.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const behaviorData = analytics ? [
    { name: 'Sold (Paper Hands)', value: analytics.analytics?.sold_count || 0, color: '#ef4444' },
    { name: 'Held (Diamond Hands)', value: analytics.analytics?.held_count || 0, color: '#3b82f6' },
    { name: 'Accumulated (Believers)', value: analytics.analytics?.accumulated_count || 0, color: '#10b981' }
  ] : [];

  const percentageData = analytics ? [
    { name: 'Sold', value: Math.round(analytics.analytics?.sold_percentage || 0) },
    { name: 'Held', value: Math.round(analytics.analytics?.held_percentage || 0) },
    { name: 'Accumulated', value: Math.round(analytics.analytics?.accumulated_percentage || 0) }
  ] : [];

  const COLORS = ['#ef4444', '#3b82f6', '#10b981'];

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
            <Link href="/dashboard" className="text-white hover:text-blue-400 transition">Dashboard</Link>
            <Link href="/recipients" className="text-gray-400 hover:text-white transition">Recipients</Link>
            <Link href="/analytics" className="text-gray-400 hover:text-white transition">Analytics</Link>
            <Link href="/search" className="text-gray-400 hover:text-white transition">Search</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-gray-400">Real-time airdrop recipient behavior analysis</p>
          </motion.div>
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
            className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-8"
          >
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Retry
            </button>
          </motion.div>
        )}

        {analytics && !loading && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <p className="text-gray-400 text-sm mb-2">Total Recipients</p>
                <p className="text-3xl font-bold text-white">{analytics.analytics?.total_recipients || 0}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <p className="text-gray-400 text-sm mb-2">Paper Hands (Sold)</p>
                <p className="text-3xl font-bold text-red-400">{analytics.analytics?.sold_count || 0}</p>
                <p className="text-sm text-gray-400 mt-2">{Math.round(analytics.analytics?.sold_percentage || 0)}%</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <p className="text-gray-400 text-sm mb-2">Diamond Hands (Held)</p>
                <p className="text-3xl font-bold text-blue-400">{analytics.analytics?.held_count || 0}</p>
                <p className="text-sm text-gray-400 mt-2">{Math.round(analytics.analytics?.held_percentage || 0)}%</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <p className="text-gray-400 text-sm mb-2">Believers (Accumulated)</p>
                <p className="text-3xl font-bold text-green-400">{analytics.analytics?.accumulated_count || 0}</p>
                <p className="text-sm text-gray-400 mt-2">{Math.round(analytics.analytics?.accumulated_percentage || 0)}%</p>
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
                <h3 className="text-lg font-bold text-white mb-6">Behavior Percentage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={percentageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Pie Chart */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <h3 className="text-lg font-bold text-white mb-6">Wallet Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={behaviorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {behaviorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Top Sellers & Diamond Hands */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Sellers */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur"
              >
                <h3 className="text-lg font-bold text-white mb-4">🔴 Top Sellers</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analytics.topSellers?.slice(0, 10).map((seller, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-mono truncate">{seller.address}</p>
                        <p className="text-xs text-gray-400">{(seller.tokens_sold / 1e6).toFixed(2)} tokens sold</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-red-400 text-sm font-bold">{idx + 1}</p>
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
                <h3 className="text-lg font-bold text-white mb-4">💎 Diamond Hands</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analytics.diamondHands?.slice(0, 10).map((holder, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-mono truncate">{holder.address}</p>
                        <p className="text-xs text-gray-400">Holding for {holder.days_holding || 0} days</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-blue-400 text-sm font-bold">{holder.days_holding || 0}d</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}