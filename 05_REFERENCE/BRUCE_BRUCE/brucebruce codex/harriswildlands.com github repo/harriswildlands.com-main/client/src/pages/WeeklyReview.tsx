/* ================================================================
   WEEKLY REVIEW - AI-Powered Goal Review Visualizer
   Visual: Growth rings with data overlays
   ================================================================ */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  Download,
  AlertTriangle,
  BarChart3,
  Brain
} from "lucide-react";
import { LaneBg } from "@/lib/coreImagery";

interface WeeklyReviewData {
  goals: any[];
  checkins: any[];
  stats: {
    startDate: string;
    endDate: string;
    completionRate: number;
    totalCheckins: number;
    completedCheckins: number;
    activeDays?: number;
    domainStats?: Record<string, { goals: number; checkins: number }>;
  };
  driftFlags: string[];
}

interface WeeklyReviewProps {
  embedded?: boolean;
}

export default function WeeklyReview({ embedded = false }: WeeklyReviewProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightCached, setInsightCached] = useState(false);

  const { data: review, isLoading } = useQuery<WeeklyReviewData>({
    queryKey: ["/api/review/weekly"]
  });

  const { mutate: generateInsight, isPending: generatingInsight } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/review/weekly/insight");
      return res.json();
    },
    onSuccess: (data) => {
      setAiInsight(data.insight);
      setInsightCached(data.cached);
    }
  });

  const handleExport = () => {
    window.open("/api/export/weekly.pdf", "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center aurora-bg">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const stats = review?.stats || {
    completionRate: 0,
    totalCheckins: 0,
    completedCheckins: 0,
    startDate: "",
    endDate: ""
  };

  const domainStats = stats.domainStats || {};
  const driftFlags = review?.driftFlags || [];

  const renderContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-1">{stats.completionRate}%</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              {stats.completionRate >= 70 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-amber-400" />}
              Completion Rate
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-1">{stats.completedCheckins}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />Completed</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-muted-foreground mb-1">{stats.totalCheckins}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Calendar className="w-4 h-4" />Total Check-ins</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-amber-400 mb-1">{driftFlags.length}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" />Drift Flags</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Domain Performance</CardTitle>
            <CardDescription>Check-in coverage by life domain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(domainStats).length > 0 ? (
              Object.entries(domainStats).map(([domain, data]: [string, any]) => {
                const expected = data.goals * 7;
                const percentage = expected > 0 ? Math.round((data.checkins / expected) * 100) : 0;
                return (
                  <div key={domain} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{domain}</span>
                      <span className="text-muted-foreground">{data.checkins}/{expected} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No domain data available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />AI Weekly Insight</CardTitle>
            <CardDescription>One actionable recommendation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiInsight ? (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-foreground leading-relaxed">{aiInsight}</p>
                {insightCached && <Badge variant="secondary" className="mt-3 text-xs">Cached for today</Badge>}
              </div>
            ) : (
              <div className="text-center py-4">
                <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm mb-4">Generate an AI insight</p>
              </div>
            )}
            <Button onClick={() => generateInsight()} disabled={generatingInsight} className="w-full gap-2" variant={aiInsight ? "outline" : "default"} data-testid="button-generate-insight">
              {generatingInsight ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />{aiInsight ? "Refresh Insight" : "Generate Insight"}</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-xl font-semibold">Weekly Review</h3>
            <p className="text-sm text-muted-foreground">{stats.startDate} to {stats.endDate}</p>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2" data-testid="button-export-review">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.root})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.root2})`,
              backgroundPosition: "center 25%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
          <div className="relative z-10 p-6 md:p-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="bg-black/70 border border-primary/40 p-4 md:p-5 backdrop-blur-md">
              <p className="font-mono text-primary/80 text-xs mb-1 tracking-wider">review@weekly:~$</p>
              <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-primary uppercase">
                WEEKLY_REVIEW<span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-primary/70 text-xs mt-2 tracking-wide">
                &gt; {stats.startDate} to {stats.endDate}
              </p>
            </div>
            
            <Button onClick={handleExport} variant="outline" className="gap-2" data-testid="button-export-review">
              <Download className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                {stats.completionRate >= 70 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                )}
                Completion Rate
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-1">
                {stats.completedCheckins}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-muted-foreground mb-1">
                {stats.totalCheckins}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Check-ins
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-amber-400 mb-1">
                {driftFlags.length}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Drift Flags
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Domain Performance */}
          <Card className="glass-card glow-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Domain Performance
              </CardTitle>
              <CardDescription>
                Check-in coverage by life domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(domainStats).length > 0 ? (
                Object.entries(domainStats).map(([domain, data]: [string, any]) => {
                  const expected = data.goals * 7;
                  const percentage = expected > 0 ? Math.round((data.checkins / expected) * 100) : 0;
                  
                  return (
                    <div key={domain} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{domain}</span>
                        <span className="text-muted-foreground">
                          {data.checkins}/{expected} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No domain data available. Create goals with domains to see performance.
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Insight */}
          <Card className="glass-card glow-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Weekly Insight
              </CardTitle>
              <CardDescription>
                One actionable recommendation based on your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsight ? (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-foreground leading-relaxed">{aiInsight}</p>
                  {insightCached && (
                    <Badge variant="secondary" className="mt-3 text-xs">
                      Cached for today
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground text-sm mb-4">
                    Generate an AI-powered insight based on your weekly performance
                  </p>
                </div>
              )}
              
              <Button
                onClick={() => generateInsight()}
                disabled={generatingInsight}
                className="w-full gap-2"
                variant={aiInsight ? "outline" : "default"}
                data-testid="button-generate-insight"
              >
                {generatingInsight ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Insight...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {aiInsight ? "Refresh Insight" : "Generate Insight"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Drift Flags */}
        {driftFlags.length > 0 && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                Drift Flags
              </CardTitle>
              <CardDescription className="text-amber-200/70">
                Areas that may need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {driftFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{flag}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Active Goals ({review?.goals?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {review?.goals && review.goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {review.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-lg bg-card/50 border border-border"
                    data-testid={`goal-card-${goal.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-foreground">{goal.title}</div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {goal.priority}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="mt-2 text-xs capitalize">
                      {goal.domain}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">
                No active goals. Create goals to track your weekly progress.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
