import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Goal, GOAL_DOMAINS, insertGoalSchema, Checkin } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isDemoMode } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, Plus, Target, CheckCircle2, Circle, Archive, 
  Pause, Play, AlertTriangle, Download, TrendingUp,
  Church, Users, Briefcase, Heart, Wrench, Home, Lightbulb, Shield
} from "lucide-react";
import { LaneBg } from "@/lib/coreImagery";

const domainIcons: Record<string, any> = {
  faith: Church,
  family: Users,
  work: Briefcase,
  health: Heart,
  logistics: Wrench,
  property: Home,
  ideas: Lightbulb,
  discipline: Shield,
};

const domainColors: Record<string, string> = {
  faith: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  family: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  work: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  health: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  logistics: "text-slate-400 bg-slate-500/10 border-slate-500/30",
  property: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  ideas: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  discipline: "text-red-400 bg-red-500/10 border-red-500/30",
};

const goalFormSchema = insertGoalSchema.extend({
  title: z.string().min(1, "Title is required"),
  domain: z.string().min(1, "Domain is required"),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

const demoGoals: Goal[] = [
  { id: 1, userId: "demo", domain: "faith", title: "Morning prayer & scripture", description: "Start each day grounded", targetType: "binary", weeklyMinimum: 7, startDate: null, dueDate: null, status: "active", priority: 1, createdAt: new Date() },
  { id: 2, userId: "demo", domain: "health", title: "Exercise 3x per week", description: "Strength or cardio", targetType: "count", weeklyMinimum: 3, startDate: null, dueDate: null, status: "active", priority: 2, createdAt: new Date() },
  { id: 3, userId: "demo", domain: "family", title: "Family dinner together", description: "No screens at the table", targetType: "binary", weeklyMinimum: 5, startDate: null, dueDate: null, status: "active", priority: 1, createdAt: new Date() },
];

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !isDemoMode(),
  });
}

export function useCheckins() {
  return useQuery<Checkin[]>({
    queryKey: ["/api/checkins"],
    enabled: !isDemoMode(),
  });
}

export function useWeeklyReview() {
  return useQuery({
    queryKey: ["/api/review/weekly"],
    enabled: !isDemoMode(),
  });
}

export default function Goals() {
  return (
    <div className="relative min-h-full">
      {/* Persistent faint background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.forest})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        {/* Hero Header with MS-DOS Console Styling - Growth Theme */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.forest2})`,
              backgroundPosition: "center 30%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="bg-black/70 border border-emerald-500/40 p-4 md:p-5 backdrop-blur-md inline-block">
            <p className="font-mono text-emerald-400/80 text-xs mb-1 tracking-wider">goals@growth:~$</p>
            <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-emerald-300 uppercase">
              GOAL_TRACKING<span className="cursor-blink">_</span>
            </h2>
            <p className="font-mono text-emerald-400/70 text-xs mt-2 tracking-wide">
              &gt; track what matters // stay aligned
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="today" data-testid="tab-today">Today</TabsTrigger>
          <TabsTrigger value="goals" data-testid="tab-goals">Manage Goals</TabsTrigger>
          <TabsTrigger value="review" data-testid="tab-review">Weekly Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-6">
          <TodayCheckin />
        </TabsContent>
        
        <TabsContent value="goals" className="mt-6">
          <GoalManagement />
        </TabsContent>
        
        <TabsContent value="review" className="mt-6">
          <WeeklyReview />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

function TodayCheckin() {
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: checkins } = useCheckins();
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");
  const isDemo = isDemoMode();

  const displayGoals = isDemo ? demoGoals : (goals || []);
  const activeGoals = displayGoals.filter(g => g.status === "active");

  const checkInMutation = useMutation({
    mutationFn: async ({ goalId, done, score, note }: { goalId: number; done: boolean; score?: number; note?: string }) => {
      if (isDemo) return { goalId, done, score, note, date: today };
      return apiRequest("POST", "/api/checkins", { goalId, date: today, done, score, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      toast({ title: isDemo ? "Demo: Check-in saved" : "Check-in saved" });
    },
  });

  const todayCheckins = isDemo ? [] : (checkins?.filter(c => c.date === today) || []);
  const getCheckin = (goalId: number) => todayCheckins.find(c => c.goalId === goalId);

  if (goalsLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (activeGoals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No active goals yet. Create your first goal to start tracking.</p>
          <Button variant="outline" asChild>
            <a href="#" onClick={() => document.querySelector('[data-testid="tab-goals"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
              <Plus className="w-4 h-4 mr-2" /> Create Goal
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Today&apos;s Check-in
          </CardTitle>
          <CardDescription>Quick 1-tap check-in for each goal. Target: under 60 seconds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeGoals.map((goal) => {
            const checkin = getCheckin(goal.id);
            const done = checkin?.done ?? false;
            const DomainIcon = domainIcons[goal.domain] || Target;

            return (
              <div 
                key={goal.id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  done ? "bg-emerald-500/5 border-emerald-500/30" : "bg-card border-border/50"
                }`}
                data-testid={`goal-checkin-${goal.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${domainColors[goal.domain]}`}>
                    <DomainIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{goal.domain} • {goal.priority === 1 ? "Trunk" : "Leaves"}</p>
                  </div>
                </div>
                <Button
                  variant={done ? "default" : "outline"}
                  size="sm"
                  onClick={() => checkInMutation.mutate({ goalId: goal.id, done: !done })}
                  disabled={checkInMutation.isPending}
                  data-testid={`button-checkin-${goal.id}`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Circle className="w-4 h-4 mr-1" />}
                  {done ? "Done" : "Mark Done"}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function GoalManagement() {
  const { data: goals, isLoading } = useGoals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { toast } = useToast();
  const isDemo = isDemoMode();

  const displayGoals = isDemo ? demoGoals : (goals || []);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      domain: "",
      targetType: "binary",
      weeklyMinimum: 1,
      priority: 2,
      status: "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GoalFormValues) => {
      console.log("Create mutation called with:", data);
      if (isDemo) return { ...data, id: Date.now(), userId: "demo", createdAt: new Date() };
      const result = await apiRequest("POST", "/api/goals", data);
      console.log("API response:", result);
      return result;
    },
    onSuccess: () => {
      console.log("Create mutation success");
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: isDemo ? "Demo: Goal created" : "Goal created" });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Create mutation error:", error);
      toast({ title: "Error creating goal", description: String(error), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Goal> & { id: number }) => {
      if (isDemo) return { ...data, id };
      return apiRequest("PUT", `/api/goals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: isDemo ? "Demo: Goal updated" : "Goal updated" });
      setEditingGoal(null);
    },
  });

  const onSubmit = (data: GoalFormValues) => {
    console.log("Form submitted with data:", data);
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    form.reset({
      title: goal.title,
      description: goal.description || "",
      domain: goal.domain,
      targetType: goal.targetType || "binary",
      weeklyMinimum: goal.weeklyMinimum || 1,
      priority: goal.priority || 2,
      status: goal.status || "active",
    });
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  const activeGoals = displayGoals.filter(g => g.status === "active");
  const archivedGoals = displayGoals.filter(g => g.status === "archived" || g.status === "paused");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Active Goals ({activeGoals.length})</h3>
          <p className="text-sm text-muted-foreground">Create goals across 8 life domains</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingGoal(null); form.reset(); } }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-goal">
              <Plus className="w-4 h-4 mr-2" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input {...form.register("title")} placeholder="e.g., Morning prayer & scripture" data-testid="input-goal-title" />
              </div>
              <div>
                <Label>Domain</Label>
                <Select 
                  value={form.watch("domain")} 
                  onValueChange={(v) => form.setValue("domain", v, { shouldValidate: true })}
                >
                  <SelectTrigger data-testid="select-goal-domain">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_DOMAINS.map((d) => {
                      const Icon = domainIcons[d];
                      return (
                        <SelectItem key={d} value={d}>
                          <span className="flex items-center gap-2 capitalize">
                            {Icon && <Icon className="w-4 h-4" />}
                            {d}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weekly Minimum</Label>
                  <Input 
                    type="number" 
                    {...form.register("weeklyMinimum", { valueAsNumber: true })} 
                    min={1} 
                    max={7}
                    data-testid="input-goal-weekly-minimum"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={String(form.watch("priority"))} 
                    onValueChange={(v) => form.setValue("priority", Number(v), { shouldValidate: true })}
                  >
                    <SelectTrigger data-testid="select-goal-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Trunk (Core)</SelectItem>
                      <SelectItem value="2">Leaves (Growth)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-goal">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeGoals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active goals. Create your first goal to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activeGoals.map((goal) => {
            const DomainIcon = domainIcons[goal.domain] || Target;
            return (
              <Card key={goal.id} className="hover:border-primary/30 transition-all" data-testid={`card-goal-${goal.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${domainColors[goal.domain]}`}>
                        <DomainIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{goal.title}</p>
                        {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs capitalize">{goal.domain}</Badge>
                          <Badge variant="secondary" className="text-xs">{goal.weeklyMinimum}x/week</Badge>
                          <Badge variant={goal.priority === 1 ? "destructive" : "secondary"} className="text-xs">
                            {goal.priority === 1 ? "Trunk" : "Leaves"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)} data-testid={`button-edit-goal-${goal.id}`}>
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => updateMutation.mutate({ id: goal.id, status: "archived" })}
                        data-testid={`button-archive-goal-${goal.id}`}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {archivedGoals.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Archived/Paused ({archivedGoals.length})</h4>
          <div className="space-y-2">
            {archivedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 opacity-60">
                <span className="text-sm">{goal.title}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateMutation.mutate({ id: goal.id, status: "active" })}
                >
                  <Play className="w-4 h-4 mr-1" /> Reactivate
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyReview() {
  const { data: review, isLoading } = useWeeklyReview();
  const isDemo = isDemoMode();

  const demoReview = {
    goals: demoGoals,
    checkins: [],
    stats: {
      completionRate: 72,
      totalCheckins: 15,
      completedCheckins: 11,
      missedDays: 2,
      startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      domainStats: {
        faith: { goals: 1, checkins: 6 },
        health: { goals: 1, checkins: 3 },
        family: { goals: 1, checkins: 4 },
      }
    },
    driftFlags: []
  };

  const displayReview = isDemo ? demoReview : review;

  if (isLoading && !isDemo) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (!displayReview) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No review data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const { stats, driftFlags, goals } = displayReview as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Weekly Review</h3>
          <p className="text-sm text-muted-foreground">{stats?.startDate} to {stats?.endDate}</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/export/weekly.pdf" target="_blank" data-testid="button-export-pdf">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-primary">{stats?.completionRate}%</div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <Progress value={stats?.completionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{stats?.completedCheckins}/{stats?.totalCheckins}</div>
            <p className="text-sm text-muted-foreground">Check-ins Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{7 - (stats?.missedDays || 0)}/7</div>
            <p className="text-sm text-muted-foreground">Days with Check-ins</p>
          </CardContent>
        </Card>
      </div>

      {stats?.domainStats && Object.keys(stats.domainStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domain Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(stats.domainStats).map(([domain, data]: [string, any]) => {
                const Icon = domainIcons[domain] || Target;
                const percentage = data.goals > 0 ? Math.round((data.checkins / (data.goals * 7)) * 100) : 0;
                return (
                  <div key={domain} className={`p-3 rounded-lg border ${domainColors[domain]}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{domain}</span>
                    </div>
                    <div className="text-lg font-bold">{percentage}%</div>
                    <p className="text-xs text-muted-foreground">{data.checkins} of {data.goals * 7} possible</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {driftFlags && driftFlags.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Drift Flags
            </CardTitle>
            <CardDescription>Factual observations from the past week. No advice, just data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {driftFlags.map((flag: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(!driftFlags || driftFlags.length === 0) && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-emerald-400 font-medium">No drift flags this week</p>
            <p className="text-sm text-muted-foreground">Goals are on track</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
