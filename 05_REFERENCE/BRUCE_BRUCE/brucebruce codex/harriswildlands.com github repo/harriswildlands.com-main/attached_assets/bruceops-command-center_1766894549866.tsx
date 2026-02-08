import React, { useState, useEffect } from 'react';
import { Search, Zap, BarChart3, Play, RefreshCw, Download, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function BruceOpsCommandCenter() {
  const [activeModule, setActiveModule] = useState('search');
  const [serverStatus, setServerStatus] = useState('checking');
  const [quota, setQuota] = useState(null);
  
  // Module states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [aiSquadQuery, setAiSquadQuery] = useState('');
  const [squadResponses, setSquadResponses] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [correlations, setCorrelations] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check server status on mount
  useEffect(() => {
    checkServer();
    fetchQuota();
  }, []);

  const checkServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('error');
      }
    } catch (err) {
      setServerStatus('offline');
    }
  };

  const fetchQuota = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/quota`);
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch (err) {
      console.log('Quota fetch failed (expected if not authenticated)');
    }
  };

  // Module 1: Smart Search
  const handleSmartSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 10 })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Search failed');
      }
      
      const data = await res.json();
      setSearchResults(data);
      fetchQuota(); // Update quota after call
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Module 2: AI Squad Panel
  const handleAiSquad = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/ai/squad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiSquadQuery })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Squad query failed');
      }
      
      const data = await res.json();
      setSquadResponses(data);
      fetchQuota();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Module 3: Weekly Synthesis
  const handleWeeklySynthesis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/ai/weekly-synthesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Synthesis failed');
      }
      
      const data = await res.json();
      setWeeklyReport(data);
      fetchQuota();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Module 4: Find Correlations
  const handleFindCorrelations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/ai/correlations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Correlation analysis failed');
      }
      
      const data = await res.json();
      setCorrelations(data);
      fetchQuota();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Server offline state
  if (serverStatus === 'offline') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-md bg-red-900/20 border-2 border-red-500 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Server Offline</h2>
          <p className="text-red-200 mb-4">
            Can't connect to localhost:5000
          </p>
          <div className="bg-slate-900 rounded p-4 text-left mb-4">
            <p className="text-sm text-slate-300 mb-2">Start your server:</p>
            <code className="text-xs bg-slate-800 px-2 py-1 rounded text-green-400">
              cd harriswildlands.com && npm run dev
            </code>
          </div>
          <button
            onClick={checkServer}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            BruceOps Command Center
          </h1>
          <div className="flex items-center gap-4">
            {quota && (
              <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">AI Quota</div>
                <div className="text-sm font-semibold">
                  {quota.remaining}/{quota.limit} remaining
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-slate-400">localhost:5000</span>
            </div>
          </div>
        </div>
        <p className="text-slate-400">Bulletproof AI Squad • Cached Responses • Rate Limited</p>
      </div>

      {/* Module Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 bg-slate-800/50 p-2 rounded-lg overflow-x-auto">
          {[
            { id: 'search', label: 'Smart Search', icon: Search },
            { id: 'squad', label: 'AI Squad', icon: Zap },
            { id: 'weekly', label: 'Weekly Synthesis', icon: BarChart3 },
            { id: 'quick', label: 'Quick Actions', icon: Play }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeModule === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-300 mb-1">Error</h3>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Module Content */}
      <div className="max-w-7xl mx-auto">
        {/* Module 1: Smart Search */}
        {activeModule === 'search' && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Search className="text-blue-400" />
              Semantic Search + AI Analysis
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">
                Query your localhost data with natural language
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
                  placeholder="e.g., 'high energy days' or 'stress patterns' or 'family reflections'"
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSmartSearch}
                  disabled={loading || !searchQuery}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                  Search
                </button>
              </div>
            </div>

            {searchResults && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle size={16} className="text-green-400" />
                  Found {searchResults.count} matches
                  {searchResults.cached && <span className="text-cyan-400">(Cached - Free!)</span>}
                </div>
                
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {searchResults.samples.map((log, i) => (
                      <div key={i} className="bg-slate-800 p-3 rounded text-sm">
                        <div className="text-slate-400 text-xs mb-1">{log.date}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Energy: {log.energy || 'N/A'}/10</div>
                          <div>Stress: {log.stress || 'N/A'}/10</div>
                          <div>Mood: {log.mood || 'N/A'}/10</div>
                          <div>Sleep: {log.sleepQuality || 'N/A'}/10</div>
                        </div>
                        {log.topWin && <div className="mt-2 text-slate-300 text-xs">Win: {log.topWin}</div>}
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                      <Zap size={16} />
                      AI Analysis
                      {searchResults.cached && <span className="text-xs bg-cyan-900 px-2 py-0.5 rounded">CACHED</span>}
                    </h4>
                    <p className="text-slate-200 text-sm leading-relaxed">{searchResults.insight}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 2: AI Squad */}
        {activeModule === 'squad' && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="text-yellow-400" />
              AI Squad Panel
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">
                Ask one question, get multiple perspectives
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiSquadQuery}
                  onChange={(e) => setAiSquadQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiSquad()}
                  placeholder="e.g., 'Should I prioritize health or work goals this week?'"
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={handleAiSquad}
                  disabled={loading || !aiSquadQuery}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:text-slate-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
                  Ask Squad
                </button>
              </div>
            </div>

            {squadResponses && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    {squadResponses.claude.perspective}
                    {squadResponses.claude.cached && <span className="text-xs bg-cyan-900 px-2 py-0.5 rounded ml-auto">CACHED</span>}
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">{squadResponses.claude.response}</p>
                </div>
                
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    {squadResponses.grok.perspective}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed italic">{squadResponses.grok.response}</p>
                </div>
                
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                  <h3 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {squadResponses.chatgpt.perspective}
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed italic">{squadResponses.chatgpt.response}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 3: Weekly Synthesis */}
        {activeModule === 'weekly' && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="text-cyan-400" />
              Weekly Synthesis Report
            </h2>
            
            <button
              onClick={handleWeeklySynthesis}
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mb-4"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <BarChart3 size={18} />}
              Generate This Week's Report
            </button>

            {weeklyReport && (
              <div className="space-y-4">
                {weeklyReport.cached && (
                  <div className="bg-cyan-900/20 border border-cyan-700 rounded px-3 py-2 text-sm text-cyan-300">
                    ⚡ Cached response - This synthesis was free!
                  </div>
                )}
                
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <h3 className="font-semibold mb-3 text-cyan-300">Week at a Glance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-2xl font-bold text-cyan-400">{weeklyReport.stats.completionRate}%</div>
                      <div className="text-xs text-slate-400">Completion</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-2xl font-bold text-green-400">{weeklyReport.stats.completedCheckins}</div>
                      <div className="text-xs text-slate-400">Completed</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-2xl font-bold text-yellow-400">{weeklyReport.stats.totalCheckins}</div>
                      <div className="text-xs text-slate-400">Total</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-2xl font-bold text-red-400">{weeklyReport.stats.missedDays}</div>
                      <div className="text-xs text-slate-400">Missed Days</div>
                    </div>
                  </div>
                  
                  <div className="bg-cyan-900/30 border border-cyan-700 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                      <Zap size={16} />
                      AI Narrative Summary
                    </h4>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{weeklyReport.narrative}</p>
                  </div>

                  {weeklyReport.driftFlags && weeklyReport.driftFlags.length > 0 && (
                    <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-300 mb-2">⚠️ Drift Flags</h4>
                      <ul className="space-y-1">
                        {weeklyReport.driftFlags.map((flag, i) => (
                          <li key={i} className="text-sm text-slate-200">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 4: Quick Actions */}
        {activeModule === 'quick' && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Play className="text-purple-400" />
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button 
                onClick={handleFindCorrelations}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 p-6 rounded-lg text-left transition-all transform hover:scale-105"
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  {loading ? <RefreshCw size={20} className="animate-spin" /> : <TrendingUp size={20} />}
                  Find Correlations
                </h3>
                <p className="text-sm text-purple-100">Discover hidden patterns in your last 30 days</p>
              </button>
              
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 p-6 rounded-lg text-left transition-all transform hover:scale-105">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Download size={20} />
                  Export All Data
                </h3>
                <p className="text-sm text-green-100">Download complete backup as JSON</p>
              </button>
            </div>

            {correlations && (
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Correlation Analysis ({correlations.daysAnalyzed} days)
                  {correlations.cached && <span className="text-xs bg-cyan-900 px-2 py-0.5 rounded">CACHED</span>}
                </h3>
                <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{correlations.correlations}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-sm text-slate-500">
        <p>BruceOps Command Center • Bulletproof Edition • Cached • Rate Limited • Cost Optimized</p>
      </div>
    </div>
  );
}