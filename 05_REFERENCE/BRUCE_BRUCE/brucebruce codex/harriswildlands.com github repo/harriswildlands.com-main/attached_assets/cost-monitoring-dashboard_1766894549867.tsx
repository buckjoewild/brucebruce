import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Zap, Database, Calendar, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function CostMonitoringDashboard() {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulated 7-day history (in production, this would come from server)
  const [weeklyData] = useState([
    { date: 'Mon', calls: 15, cached: 8, cost: 0.032 },
    { date: 'Tue', calls: 23, cached: 12, cost: 0.050 },
    { date: 'Wed', calls: 18, cached: 13, cost: 0.023 },
    { date: 'Thu', calls: 31, cached: 19, cost: 0.054 },
    { date: 'Fri', calls: 12, cached: 8, cost: 0.018 },
    { date: 'Sat', calls: 8, cached: 5, cost: 0.014 },
    { date: 'Today', calls: 0, cached: 0, cost: 0.000 }
  ]);

  const fetchQuota = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/quota`);
      if (!res.ok) throw new Error('Failed to fetch quota');
      const data = await res.json();
      
      // Update today's data with real quota
      weeklyData[6].calls = data.used;
      weeklyData[6].cached = data.cacheSize;
      weeklyData[6].cost = data.used * 0.0045;
      
      setQuota(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
    const interval = setInterval(fetchQuota, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const totalWeeklyCalls = weeklyData.reduce((sum, day) => sum + day.calls, 0);
  const totalWeeklyCached = weeklyData.reduce((sum, day) => sum + day.cached, 0);
  const totalWeeklyCost = weeklyData.reduce((sum, day) => sum + day.cost, 0);
  const cacheHitRate = totalWeeklyCalls > 0 ? ((totalWeeklyCached / totalWeeklyCalls) * 100).toFixed(1) : 0;
  
  const projectedMonthlyCost = (totalWeeklyCost / 7) * 30;
  const estimatedWithCache = projectedMonthlyCost * (1 - (parseFloat(cacheHitRate) / 100));

  if (loading && !quota) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-400" size={48} />
          <p className="text-slate-400">Loading cost data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Cost Monitor
            </h1>
            <p className="text-slate-400">AI Usage & Cost Analytics</p>
          </div>
          <button
            onClick={fetchQuota}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        <div className="text-xs text-slate-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <div>
            <p className="text-red-200">{error}</p>
            <p className="text-red-300 text-xs mt-1">Make sure localhost:5000 is running</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Today's Usage */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="text-blue-400" size={24} />
            <span className="text-xs text-blue-300">Today</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {quota?.used || 0}/{quota?.limit || 100}
          </div>
          <div className="text-sm text-blue-200">API Calls Used</div>
          <div className="mt-3 bg-slate-900/50 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${quota ? (quota.used / quota.limit) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Today's Cost */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-400" size={24} />
            <span className="text-xs text-green-300">Today</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            ${quota ? (quota.used * 0.0045).toFixed(3) : '0.000'}
          </div>
          <div className="text-sm text-green-200">Estimated Cost</div>
          <div className="mt-3 text-xs text-green-300">
            @ $0.0045 per call
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Database className="text-purple-400" size={24} />
            <span className="text-xs text-purple-300">7 Days</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {cacheHitRate}%
          </div>
          <div className="text-sm text-purple-200">Cache Hit Rate</div>
          <div className="mt-3 text-xs text-purple-300">
            {totalWeeklyCached} cached / {totalWeeklyCalls} total
          </div>
        </div>

        {/* Monthly Projection */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border border-orange-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-orange-400" size={24} />
            <span className="text-xs text-orange-300">Projected</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            ${estimatedWithCache.toFixed(2)}
          </div>
          <div className="text-sm text-orange-200">Est. Monthly Cost</div>
          <div className="mt-3 text-xs text-orange-300">
            With {cacheHitRate}% cache savings
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={24} />
            7-Day Usage Trend
          </h2>
          
          <div className="flex items-end justify-between h-64 gap-2">
            {weeklyData.map((day, i) => {
              const maxCalls = Math.max(...weeklyData.map(d => d.calls));
              const height = (day.calls / maxCalls) * 100;
              const cachedHeight = (day.cached / maxCalls) * 100;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative" style={{ height: '200px' }}>
                    {/* Cached portion */}
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-500 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${cachedHeight}%` }}
                      title={`${day.cached} cached`}
                    />
                    {/* API calls portion */}
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                      title={`${day.calls} total calls`}
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs font-semibold text-slate-300">{day.date}</div>
                    <div className="text-xs text-slate-500">{day.calls} calls</div>
                    <div className="text-xs text-cyan-400">${day.cost.toFixed(3)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-slate-300">API Calls</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded"></div>
              <span className="text-slate-300">Cached (Free)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Summary */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="text-green-400" size={20} />
            This Week
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span className="text-slate-300">Total API Calls</span>
              <span className="font-bold text-white">{totalWeeklyCalls}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span className="text-slate-300">Cached Responses</span>
              <span className="font-bold text-cyan-400">{totalWeeklyCached}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span className="text-slate-300">Cache Hit Rate</span>
              <span className="font-bold text-purple-400">{cacheHitRate}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-900/30 border border-green-700 rounded">
              <span className="text-green-300 font-semibold">Total Cost</span>
              <span className="font-bold text-green-400">${totalWeeklyCost.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Cost Projections */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="text-orange-400" size={20} />
            Monthly Projection
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span className="text-slate-300">Without Caching</span>
              <span className="font-bold text-slate-400 line-through">${projectedMonthlyCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span className="text-slate-300">Cache Savings</span>
              <span className="font-bold text-cyan-400">-${(projectedMonthlyCost - estimatedWithCache).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-900/30 border border-orange-700 rounded">
              <span className="text-orange-300 font-semibold">With Caching</span>
              <span className="font-bold text-orange-400">${estimatedWithCache.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-green-900/20 border border-green-700 rounded text-center">
              <div className="text-xs text-green-300 mb-1">Estimated Annual Cost</div>
              <div className="text-2xl font-bold text-green-400">${(estimatedWithCache * 12).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${
          quota && quota.remaining > 50 
            ? 'bg-green-900/20 border-green-700' 
            : quota && quota.remaining > 20
            ? 'bg-yellow-900/20 border-yellow-700'
            : 'bg-red-900/20 border-red-700'
        }`}>
          <div className="flex items-center gap-3">
            {quota && quota.remaining > 50 ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <AlertCircle className="text-yellow-400" size={20} />
            )}
            <div>
              <div className="text-sm font-semibold">Quota Status</div>
              <div className="text-xs text-slate-400">
                {quota?.remaining || 0} calls remaining today
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Database className="text-blue-400" size={20} />
            <div>
              <div className="text-sm font-semibold">Cache Efficiency</div>
              <div className="text-xs text-slate-400">
                {quota?.cacheSize || 0} responses cached
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-700 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-purple-400" size={20} />
            <div>
              <div className="text-sm font-semibold">Cost Trend</div>
              <div className="text-xs text-slate-400">
                {estimatedWithCache < 1 ? 'Excellent' : estimatedWithCache < 5 ? 'Good' : 'Review usage'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-sm text-slate-500">
        <p>Cost calculations based on $0.0045 per API call (Claude Sonnet 4 average)</p>
        <p className="text-xs mt-1">Actual costs may vary based on token usage</p>
      </div>
    </div>
  );
}