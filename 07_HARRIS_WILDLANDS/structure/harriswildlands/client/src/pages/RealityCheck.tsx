/* ================================================================
   REALITY CHECK - AI-Powered Idea Validation Dashboard
   Visual: Neural constellation with decision overlays
   ================================================================ */

import { useState } from "react";
import { useIdeas, useRealityCheck } from "@/hooks/use-bruce-ops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  TrendingUp, 
  Archive, 
  Trash2, 
  Loader2,
  BrainCircuit,
  Sparkles,
  Target
} from "lucide-react";
import { LaneBg } from "@/lib/coreImagery";
import type { Idea } from "@shared/schema";

export default function RealityCheck() {
  const { data: ideas = [], isLoading: loadingIdeas } = useIdeas();
  const { mutate: runRealityCheck, isPending: loading } = useRealityCheck();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [realityCheck, setRealityCheck] = useState<any>(null);

  const filteredIdeas = ideas.filter(
    (idea) => idea.status === "draft" || idea.status === "reality_checked"
  );

  const handleRealityCheck = () => {
    if (!selectedIdea) return;
    
    runRealityCheck(selectedIdea.id, {
      onSuccess: (updated) => {
        setRealityCheck(updated.realityCheck);
      },
      onError: (error) => {
        console.error("Reality check failed:", error);
        setRealityCheck({
          known: [],
          likely: [],
          speculation: [],
          flags: [`Error: ${error.message}`],
          decision: "Park",
          reasoning: "Unable to complete analysis. Try again."
        });
      }
    });
  };

  const getDecisionStyle = (decision: string) => {
    const styles: Record<string, string> = {
      Promote: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
      Salvage: "bg-amber-500/20 border-amber-500/40 text-amber-300",
      Park: "bg-blue-500/20 border-blue-500/40 text-blue-300",
      Discard: "bg-red-500/20 border-red-500/40 text-red-300"
    };
    return styles[decision] || "bg-muted border-border text-muted-foreground";
  };

  const getDecisionIcon = (decision: string) => {
    const icons: Record<string, JSX.Element> = {
      Promote: <TrendingUp className="w-5 h-5" />,
      Salvage: <Target className="w-5 h-5" />,
      Park: <Archive className="w-5 h-5" />,
      Discard: <Trash2 className="w-5 h-5" />
    };
    return icons[decision] || <HelpCircle className="w-5 h-5" />;
  };

  if (loadingIdeas) {
    return (
      <div className="min-h-full flex items-center justify-center aurora-bg">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.canopy2})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        {/* Hero Header */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.canopy})`,
              backgroundPosition: "center 25%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
          <div className="relative z-10 p-6 md:p-8">
            <div className="bg-black/70 border border-primary/40 p-4 md:p-5 backdrop-blur-md max-w-md">
              <p className="font-mono text-primary/80 text-xs mb-1 tracking-wider">reality@check:~$</p>
              <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-primary uppercase">
                REALITY_CHECK<span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-primary/70 text-xs mt-2 tracking-wide">
                &gt; AI-powered idea validation // separate facts from fiction
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Idea Selection Panel */}
          <Card className="glass-card glow-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                Select Idea to Analyze
              </CardTitle>
              <CardDescription>
                Choose an idea from your inbox to run through the reality check
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredIdeas.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No ideas to check. Create one in ThinkOps first.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {filteredIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => {
                        setSelectedIdea(idea);
                        if (idea.realityCheck) {
                          setRealityCheck(idea.realityCheck);
                        } else {
                          setRealityCheck(null);
                        }
                      }}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        selectedIdea?.id === idea.id
                          ? "bg-primary/20 border-primary/50"
                          : "bg-card/50 border-border hover:bg-card/80"
                      }`}
                      data-testid={`idea-card-${idea.id}`}
                    >
                      <div className="font-medium text-foreground">{idea.title}</div>
                      {idea.pitch && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {idea.pitch}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {idea.category || "uncategorized"}
                        </Badge>
                        {idea.excitement && (
                          <Badge variant="outline" className="text-xs">
                            Excitement: {idea.excitement}/10
                          </Badge>
                        )}
                        {idea.realityCheck && (
                          <Badge variant="default" className="text-xs">
                            Analyzed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedIdea && (
                <Button
                  onClick={handleRealityCheck}
                  disabled={loading}
                  className="w-full mt-4 gap-2"
                  data-testid="button-run-reality-check"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run Reality Check
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-4">
            {realityCheck ? (
              <>
                {/* Decision Card */}
                <Card className={`border-2 ${getDecisionStyle(realityCheck.decision)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {getDecisionIcon(realityCheck.decision)}
                      <h3 className="text-xl font-bold">
                        Decision: {realityCheck.decision}
                      </h3>
                    </div>
                    <p className="text-sm opacity-90">{realityCheck.reasoning}</p>
                  </CardContent>
                </Card>

                {/* Known Facts */}
                {realityCheck.known?.length > 0 && (
                  <Card className="bg-emerald-500/10 border-emerald-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
                        <CheckCircle className="w-5 h-5" />
                        Known ({realityCheck.known.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {realityCheck.known.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-emerald-100">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Likely Assumptions */}
                {realityCheck.likely?.length > 0 && (
                  <Card className="bg-amber-500/10 border-amber-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-amber-400 text-lg">
                        <HelpCircle className="w-5 h-5" />
                        Likely ({realityCheck.likely.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {realityCheck.likely.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-amber-100">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Speculation */}
                {realityCheck.speculation?.length > 0 && (
                  <Card className="bg-violet-500/10 border-violet-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-violet-400 text-lg">
                        <Sparkles className="w-5 h-5" />
                        Speculation ({realityCheck.speculation.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {realityCheck.speculation.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-violet-100">
                            <span className="text-violet-400 mt-0.5">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Self-Deception Flags */}
                {realityCheck.flags?.length > 0 && (
                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-red-400 text-lg">
                        <AlertCircle className="w-5 h-5" />
                        Self-Deception Flags ({realityCheck.flags.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {realityCheck.flags.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-red-100">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-sm text-muted-foreground/70">
                    Select an idea and run a reality check to see AI-powered analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
