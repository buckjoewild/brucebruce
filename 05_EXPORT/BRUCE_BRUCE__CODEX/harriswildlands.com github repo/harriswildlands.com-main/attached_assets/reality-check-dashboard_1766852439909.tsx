import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, HelpCircle, TrendingUp, Archive, Trash2, Loader2 } from 'lucide-react';

// THIS COMPONENT INTEGRATES WITH YOUR EXISTING API
// API Route: POST /api/ideas/:id/reality-check-enhanced
// Returns: { known[], likely[], speculation[], flags[], decision, reasoning, searchContext }

export default function RealityCheckDashboard() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [realityCheck, setRealityCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(true);

  // Load user's ideas from your existing API
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const response = await fetch('/api/ideas');
      const data = await response.json();
      setIdeas(data.filter(idea => idea.status === 'draft' || idea.status === 'reality_checked'));
      setLoadingIdeas(false);
    } catch (error) {
      console.error('Failed to load ideas:', error);
      setLoadingIdeas(false);
    }
  };

  const runRealityCheck = async () => {
    if (!selectedIdea) return;
    
    setLoading(true);
    
    try {
      // Call your existing API endpoint (enhanced version)
      const response = await fetch(`/api/ideas/${selectedIdea.id}/reality-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Reality check failed');
      
      const updated = await response.json();
      setRealityCheck(updated.realityCheck);
      
      // Refresh ideas list
      await loadIdeas();
    } catch (error) {
      console.error('Reality check failed:', error);
      setRealityCheck({
        known: [],
        likely: [],
        speculation: [],
        flags: [`Error: ${error.message}`],
        decision: "Park",
        reasoning: "Unable to complete analysis"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision) => {
    const colors = {
      Promote: 'bg-green-100 text-green-800 border-green-300',
      Salvage: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Park: 'bg-blue-100 text-blue-800 border-blue-300',
      Discard: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[decision] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getDecisionIcon = (decision) => {
    const icons = {
      Promote: <TrendingUp className="w-5 h-5" />,
      Salvage: <HelpCircle className="w-5 h-5" />,
      Park: <Archive className="w-5 h-5" />,
      Discard: <Trash2 className="w-5 h-5" />
    };
    return icons[decision] || <HelpCircle className="w-5 h-5" />;
  };

  if (loadingIdeas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Reality Check Dashboard</h1>
          <p className="text-purple-300">AI-powered analysis with web search validation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Idea Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Select Idea</h2>
            
            {ideas.length === 0 ? (
              <p className="text-gray-400">No ideas to check. Create one first.</p>
            ) : (
              <div className="space-y-3">
                {ideas.map(idea => (
                  <div
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedIdea?.id === idea.id
                        ? 'bg-purple-600 border-2 border-purple-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-bold">{idea.title}</div>
                    {idea.pitch && <div className="text-sm text-gray-300 mt-1">{idea.pitch}</div>}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded">
                        {idea.category || 'uncategorized'}
                      </span>
                      {idea.excitement && (
                        <span className="text-xs bg-yellow-900/50 text-yellow-200 px-2 py-1 rounded">
                          Excitement: {idea.excitement}/10
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedIdea && (
              <button
                onClick={runRealityCheck}
                disabled={loading}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running Reality Check...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Run Reality Check
                  </>
                )}
              </button>
            )}
          </div>

          {/* Results */}
          <div className="space-y-6">
            {realityCheck && (
              <>
                {/* Decision */}
                <div className={`backdrop-blur-lg rounded-xl p-6 border-2 ${getDecisionColor(realityCheck.decision)}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {getDecisionIcon(realityCheck.decision)}
                    <h3 className="text-2xl font-bold">Decision: {realityCheck.decision}</h3>
                  </div>
                  <p className="text-sm opacity-90">{realityCheck.reasoning}</p>
                </div>

                {/* Known */}
                {realityCheck.known?.length > 0 && (
                  <div className="bg-green-900/30 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Known ({realityCheck.known.length})
                    </h3>
                    <ul className="space-y-2">
                      {realityCheck.known.map((item, i) => (
                        <li key={i} className="text-green-100 flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Likely */}
                {realityCheck.likely?.length > 0 && (
                  <div className="bg-yellow-900/30 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
                    <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Likely ({realityCheck.likely.length})
                    </h3>
                    <ul className="space-y-2">
                      {realityCheck.likely.map((item, i) => (
                        <li key={i} className="text-yellow-100 flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Speculation */}
                {realityCheck.speculation?.length > 0 && (
                  <div className="bg-purple-900/30 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                    <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Speculation ({realityCheck.speculation.length})
                    </h3>
                    <ul className="space-y-2">
                      {realityCheck.speculation.map((item, i) => (
                        <li key={i} className="text-purple-100 flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Flags */}
                {realityCheck.flags?.length > 0 && (
                  <div className="bg-red-900/30 backdrop-blur-lg rounded-xl p-6 border border-red-500/30">
                    <h3 className="text-xl font-bold text-red-300 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Self-Deception Flags ({realityCheck.flags.length})
                    </h3>
                    <ul className="space-y-2">
                      {realityCheck.flags.map((item, i) => (
                        <li key={i} className="text-red-100 flex items-start gap-2">
                          <span className="text-red-400 mt-1">⚠</span>
                          <span className="text-sm font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}