/* ================================================================
   BRUCE STEWARD CHAT - AI Operations Assistant
   Visual: Conversational interface with Holo-Atlas styling
   ================================================================ */

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  TrendingUp, 
  BookOpen, 
  Lightbulb, 
  Trash2, 
  Loader2,
  MessageSquare,
  Bot,
  User
} from "lucide-react";
import { LaneBg } from "@/lib/coreImagery";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatProps {
  embedded?: boolean;
}

export default function Chat({ embedded = false }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = () => {
    try {
      const stored = localStorage.getItem("bruce-chat-history");
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([{
          role: "assistant",
          content: "Hey Bruce. I'm here to help analyze patterns, check ideas, or pull insights from your data. What do you need?",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.log("No previous conversation found");
    }
  };

  const saveConversation = (newMessages: Message[]) => {
    try {
      localStorage.setItem("bruce-chat-history", JSON.stringify(newMessages));
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("bruce-chat-history");
    setMessages([{
      role: "assistant",
      content: "Conversation cleared. What do you need?",
      timestamp: new Date().toISOString()
    }]);
  };

  const loadUserContext = async () => {
    try {
      const [logsRes, ideasRes, goalsRes, reviewRes] = await Promise.all([
        fetch("/api/logs").then(r => r.ok ? r.json() : []),
        fetch("/api/ideas").then(r => r.ok ? r.json() : []),
        fetch("/api/goals").then(r => r.ok ? r.json() : []),
        fetch("/api/review/weekly").then(r => r.ok ? r.json() : null)
      ]);

      return JSON.stringify({
        recentLogs: `${logsRes?.length || 0} logs total`,
        activeIdeas: ideasRes?.filter((i: any) => i.status === "draft" || i.status === "promoted").length || 0,
        activeGoals: goalsRes?.filter((g: any) => g.status === "active").length || 0,
        weeklyCompletion: reviewRes?.stats?.completionRate || "unknown"
      });
    } catch (error) {
      console.error("Failed to load context:", error);
      return null;
    }
  };

  const { mutate: sendMessage, isPending: loading } = useMutation({
    mutationFn: async (userInput: string) => {
      const userMessage: Message = {
        role: "user",
        content: userInput,
        timestamp: new Date().toISOString()
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");

      // Load context if query suggests it's needed
      let context = null;
      const needsContext = /pattern|data|goal|idea|week|log|progress|how am i/i.test(userInput);
      
      if (needsContext) {
        context = await loadUserContext();
      }

      // Build conversation history for the API
      const conversationHistory = newMessages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await apiRequest("POST", "/api/chat", {
        messages: conversationHistory,
        context
      });

      return { data: await res.json(), newMessages };
    },
    onSuccess: ({ data, newMessages }) => {
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp || new Date().toISOString()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveConversation(updatedMessages);
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error.message}. Your data is safe, but I couldn't process that request.`,
        timestamp: new Date().toISOString()
      };
      const updatedMessages = [...messages, errorMessage];
      setMessages(updatedMessages);
    }
  });

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { icon: <TrendingUp className="w-4 h-4" />, text: "Analyze patterns", query: "What patterns do you see in my recent data?" },
    { icon: <Lightbulb className="w-4 h-4" />, text: "Check ideas", query: "Which of my ideas should I focus on?" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Goal progress", query: "How am I doing on my goals?" }
  ];

  const renderChatUI = () => (
    <div className="flex flex-col h-[600px]">
      <Card className="glass-card mb-4 flex-shrink-0">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Bruce Steward</CardTitle>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
              </div>
            </div>
            <Button onClick={clearHistory} variant="ghost" size="icon" className="text-destructive" data-testid="button-clear-chat">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="glass-card flex-1 overflow-hidden mb-4">
        <CardContent className="p-4 h-full overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`} data-testid={`message-${msg.role}-${i}`}>
                  <div className="flex items-center gap-2 mb-2 opacity-70">
                    {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span className="text-xs">{msg.role === "user" ? "You" : "Steward"}</span>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-xl p-4">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything..." className="flex-1" disabled={loading} data-testid="input-chat" />
            <Button onClick={handleSend} disabled={!input.trim() || loading} className="gap-2" data-testid="button-send-chat">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (embedded) {
    return renderChatUI();
  }

  return (
    <div className="relative min-h-full flex flex-col">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.systems})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/95 via-background/98 to-background pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full max-h-[calc(100vh-120px)]">
        {/* Header */}
        <Card className="glass-card mb-4 flex-shrink-0">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Bruce Steward</CardTitle>
                  <p className="text-xs text-muted-foreground">AI Operations Assistant</p>
                </div>
              </div>
              <Button
                onClick={clearHistory}
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Clear conversation"
                data-testid="button-clear-chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="glass-card flex-1 overflow-hidden mb-4">
          <CardContent className="p-4 h-full overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                    data-testid={`message-${msg.role}-${i}`}
                  >
                    <div className="flex items-center gap-2 mb-2 opacity-70">
                      {msg.role === "user" ? (
                        <User className="w-3 h-3" />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                      <span className="text-xs">
                        {msg.role === "user" ? "You" : "Steward"}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    <div className="text-xs opacity-50 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
            {quickPrompts.map((prompt, i) => (
              <Button
                key={i}
                onClick={() => setInput(prompt.query)}
                variant="outline"
                size="sm"
                className="gap-2"
                data-testid={`quick-prompt-${i}`}
              >
                {prompt.icon}
                <span>{prompt.text}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Input */}
        <Card className="glass-card flex-shrink-0">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your data..."
                className="flex-1"
                disabled={loading}
                data-testid="input-chat"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="gap-2"
                data-testid="button-send-chat"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              I analyze your BruceOps data and help with teaching. Responses kept concise to save costs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
