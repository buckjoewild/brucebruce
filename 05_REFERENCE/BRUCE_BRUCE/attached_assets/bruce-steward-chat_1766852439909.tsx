import React, { useState, useEffect, useRef } from 'react';
import { Send, TrendingUp, BookOpen, Lightbulb, Trash2, Loader2 } from 'lucide-react';

// THIS COMPONENT CALLS YOUR EXISTING APIS
// Uses: GET /api/logs, GET /api/ideas, GET /api/goals, GET /api/review/weekly
// Chat powered by Claude API (client-side, no backend needed)
// Conversation stored in localStorage (no persistent storage API calls)

export default function BruceStewardChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = () => {
    try {
      const stored = localStorage.getItem('bruce-chat-history');
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([{
          role: 'assistant',
          content: "Hey Bruce. I'm here to help analyze patterns, check ideas, or pull insights from your data. What do you need?",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.log('No previous conversation found');
    }
  };

  const saveConversation = (newMessages) => {
    try {
      localStorage.setItem('bruce-chat-history', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('bruce-chat-history');
    setMessages([{
      role: 'assistant',
      content: "Conversation cleared. What do you need?",
      timestamp: new Date().toISOString()
    }]);
  };

  const loadUserContext = async () => {
    try {
      // Call your actual APIs
      const [logsRes, ideasRes, goalsRes, reviewRes] = await Promise.all([
        fetch('/api/logs').then(r => r.ok ? r.json() : []),
        fetch('/api/ideas').then(r => r.ok ? r.json() : []),
        fetch('/api/goals').then(r => r.ok ? r.json() : []),
        fetch('/api/review/weekly').then(r => r.ok ? r.json() : null)
      ]);

      return {
        recentLogs: logsRes.slice(0, 7),
        activeIdeas: ideasRes.filter(i => i.status === 'draft' || i.status === 'promoted').slice(0, 5),
        activeGoals: goalsRes.filter(g => g.status === 'active'),
        weeklyStats: reviewRes?.stats || null
      };
    } catch (error) {
      console.error('Failed to load context:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Load context only if query suggests it's needed
      let contextData = null;
      const needsContext = /pattern|data|goal|idea|week|log|progress|how am i/i.test(input);
      
      if (needsContext) {
        contextData = await loadUserContext();
      }

      // Build conversation history (last 6 messages only to save tokens)
      const conversationHistory = newMessages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // System prompt
      let systemPrompt = `You are speaking directly to Bruce Harris - a dad, 5th/6th grade teacher, creator, and builder.
Bruce is building his personal operating system called BruceOps to manage his life, ideas, teaching, and creative work.
Always address him as "Bruce" and speak with the directness of a trusted advisor who knows his goals.
Be practical, honest, and help him stay aligned with his values: faith, family, building things that matter.

IMPORTANT RULES:
- Structure only, never prescribe decisions
- Flag patterns, don't judge them
- No therapy-speak or life coaching
- Short answers (2-3 sentences unless he asks for more)
- When uncertain, say so`;

      if (contextData) {
        const contextSummary = {
          recentActivity: `${contextData.recentLogs?.length || 0} logs in past week`,
          activeIdeas: contextData.activeIdeas?.length || 0,
          activeGoals: contextData.activeGoals?.length || 0,
          weeklyCompletion: contextData.weeklyStats?.completionRate || 'unknown'
        };
        systemPrompt += `\n\nBRUCE'S CURRENT DATA: ${JSON.stringify(contextSummary)}`;
      }

      // Determine if web search is needed
      const needsSearch = /search|find|current|latest|recent news|what's new/i.test(input);
      const tools = needsSearch ? [{
        type: "web_search_20250305",
        name: "web_search"
      }] : [];

      // Call Claude API (client-side)
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500, // Keep responses concise to save costs
          system: systemPrompt,
          tools: tools,
          messages: conversationHistory
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content.map(item => item.text || '').join('\n').trim(),
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveConversation(updatedMessages);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}. Your data is safe, but I couldn't process that request.`,
        timestamp: new Date().toISOString()
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { icon: <TrendingUp className="w-4 h-4" />, text: "Analyze patterns", query: "What patterns do you see in my recent data?" },
    { icon: <Lightbulb className="w-4 h-4" />, text: "Check ideas", query: "Which of my ideas should I focus on?" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Goal progress", query: "How am I doing on my goals?" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-t-xl p-4 border border-white/20 border-b-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Bruce Steward</h1>
            <p className="text-sm text-purple-300">AI operations assistant</p>
          </div>
          <button
            onClick={clearHistory}
            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white/5 backdrop-blur-lg overflow-y-auto p-6 space-y-4 border-l border-r border-white/20">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                <div className="text-xs opacity-50 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white border border-white/20 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="bg-white/5 backdrop-blur-lg p-4 border-l border-r border-white/20">
            <div className="text-xs text-purple-300 mb-2 uppercase tracking-wide">Quick Actions</div>
            <div className="grid grid-cols-3 gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt.query)}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm p-3 rounded-lg flex items-center gap-2 transition-colors border border-white/10"
                >
                  {prompt.icon}
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white/10 backdrop-blur-lg rounded-b-xl p-4 border border-white/20 border-t-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-purple-300 mt-2">
            💡 I analyze your data and help with teaching. Responses kept under 500 tokens to save costs.
          </div>
        </div>
      </div>
    </div>
  );
}