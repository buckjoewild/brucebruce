/* ================================================================
   THINKOPS - Ideas Lane
   Invention, learning, experiments, reality-checking, building
   Visual: Neural constellation with mind map tree
   ================================================================ */

import { useState } from "react";
import { useIdeas, useCreateIdea, useUpdateIdea, useRealityCheck, useTranscripts, useTranscriptStats, useCreateTranscript, useAnalyzeTranscript, useDeleteTranscript } from "@/hooks/use-bruce-ops";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIdeaSchema, IDEA_CATEGORIES, TIME_ESTIMATES, type Idea } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, BrainCircuit, Rocket, Archive, Lightbulb, Zap, Star, Clock, Users, Target, Heart, FlaskConical, BookOpen, Home, Cross, Leaf, Mic, FileText, BarChart3, Trash2, Play, Upload } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import { CanopyView } from "@/components/CanopyView";
import CoreImagery, { LaneBg } from "@/lib/coreImagery";

type IdeaFormValues = z.infer<typeof insertIdeaSchema>;

const CATEGORY_ICONS: Record<string, any> = {
  tech: FlaskConical,
  business: Target,
  creative: Lightbulb,
  family: Home,
  faith: Cross,
  learning: BookOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  tech: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  business: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  creative: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  family: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  faith: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  learning: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

const PITCH_EXAMPLES = [
  "It's like Notion but for dads tracking family goals",
  "A weekly email that curates the best faith podcasts",
  "A simple app that gamifies habit tracking for kids",
  "A course teaching teachers to use AI effectively",
];

const TINY_TEST_EXAMPLES = [
  "Post about it on Twitter and gauge interest",
  "Build a landing page and collect 10 email signups",
  "Create a prototype and show 3 potential users",
  "Write a blog post explaining the concept",
  "Record a 2-minute explainer video",
];

export default function ThinkOps() {
  const [activeTab, setActiveTab] = useState("canopy");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="relative min-h-full">
      {/* Persistent faint background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.canopy2})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        {/* Hero Header with MS-DOS Console Styling - Canopy Theme */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.canopy})`,
              backgroundPosition: "center 25%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
        <div className="relative z-10 p-6 md:p-8 flex items-center justify-between gap-4">
          <div className="bg-black/70 border border-violet-500/40 p-4 md:p-5 backdrop-blur-md">
            <p className="font-mono text-violet-400/80 text-xs mb-1 tracking-wider">thinkops@canopy:~$</p>
            <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-violet-300 uppercase">
              THINK_OPS<span className="cursor-blink">_</span>
            </h2>
            <p className="font-mono text-violet-400/70 text-xs mt-2 tracking-wide">
              &gt; ideas channel // from spark to shipment
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-violet-500/25" data-testid="button-new-idea">
                <Plus className="w-4 h-4" /> New Idea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-400" />
                  Capture New Idea
                </DialogTitle>
              </DialogHeader>
              <CaptureIdeaForm onSuccess={() => {
                setDialogOpen(false);
                setActiveTab("reality");
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[850px]">
          <TabsTrigger value="canopy" data-testid="tab-canopy">
            <Leaf className="w-4 h-4 mr-2" /> Canopy
          </TabsTrigger>
          <TabsTrigger value="braindumps" data-testid="tab-braindumps">
            <Mic className="w-4 h-4 mr-2" /> Braindumps
          </TabsTrigger>
          <TabsTrigger value="capture" data-testid="tab-inbox">
            <Lightbulb className="w-4 h-4 mr-2" /> Inbox
          </TabsTrigger>
          <TabsTrigger value="reality" data-testid="tab-reality">
            <BrainCircuit className="w-4 h-4 mr-2" /> Reality Check
          </TabsTrigger>
          <TabsTrigger value="build" data-testid="tab-build">
            <Rocket className="w-4 h-4 mr-2" /> Build & Ship
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="canopy" className="mt-6">
          <CanopyView />
        </TabsContent>
        
        <TabsContent value="braindumps" className="mt-6">
          <BraindumpsPanel />
        </TabsContent>
        
        <TabsContent value="capture" className="mt-6">
          <IdeaList filter="draft" />
        </TabsContent>
        
        <TabsContent value="reality" className="mt-6">
          <IdeaList filter="reality" />
        </TabsContent>
        
        <TabsContent value="build" className="mt-6">
          <IdeaList filter="promoted" />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

function CaptureIdeaForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutate: createIdea, isPending } = useCreateIdea();
  const [captureMode, setCaptureMode] = useState<"quick" | "deep">("quick");
  
  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(insertIdeaSchema),
    defaultValues: {
      status: "draft",
      captureMode: "quick",
      category: "tech",
      excitement: 5,
      feasibility: 5,
    }
  });

  const onSubmit = (data: IdeaFormValues) => {
    createIdea({ ...data, captureMode }, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
      {/* Capture Mode Toggle */}
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-lg">
        <Button
          type="button"
          variant={captureMode === "quick" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setCaptureMode("quick")}
          data-testid="button-quick-mode"
        >
          <Zap className="w-4 h-4 mr-2" /> Quick Capture
        </Button>
        <Button
          type="button"
          variant={captureMode === "deep" ? "default" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setCaptureMode("deep")}
          data-testid="button-deep-mode"
        >
          <BrainCircuit className="w-4 h-4 mr-2" /> Deep Dive
        </Button>
      </div>

      {/* Category Selection */}
      <div className="space-y-3">
        <Label>Category</Label>
        <RadioGroup
          value={form.watch("category") || "tech"}
          onValueChange={(v) => form.setValue("category", v)}
          className="flex flex-wrap gap-2"
        >
          {IDEA_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Lightbulb;
            return (
              <div key={cat}>
                <RadioGroupItem value={cat} id={`cat-${cat}`} className="peer sr-only" />
                <Label
                  htmlFor={`cat-${cat}`}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm peer-data-[state=checked]:border-violet-500 peer-data-[state=checked]:bg-violet-500/10 hover-elevate ${CATEGORY_COLORS[cat] || ''}`}
                  data-testid={`radio-cat-${cat}`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Basic Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Idea Title</Label>
          <Input 
            {...form.register("title")} 
            placeholder="Give your idea a memorable name" 
            data-testid="input-idea-title" 
          />
        </div>

        <div className="space-y-2">
          <Label>The Pitch (One sentence)</Label>
          <Input 
            {...form.register("pitch")} 
            placeholder={PITCH_EXAMPLES[Math.floor(Math.random() * PITCH_EXAMPLES.length)]}
            data-testid="input-idea-pitch" 
          />
          <p className="text-xs text-muted-foreground">Tip: "It's like X but for Y..." format works great</p>
        </div>
      </div>

      {/* Deep Capture Fields */}
      {captureMode === "deep" && (
        <div className="space-y-4 p-4 bg-secondary/10 rounded-lg border border-border/30">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" /> Deep Dive Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" /> Who is it for?
              </Label>
              <Input 
                {...form.register("whoItHelps")} 
                placeholder="e.g., Busy dads, New teachers, Solo founders"
                data-testid="input-who-helps" 
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" /> Pain it solves?
              </Label>
              <Input 
                {...form.register("painItSolves")} 
                placeholder="e.g., Overwhelm, Time waste, Confusion"
                data-testid="input-pain-solves" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" /> Why do I care?
            </Label>
            <Textarea 
              {...form.register("whyICare")} 
              placeholder="What makes this personal? Why does it excite you?"
              data-testid="textarea-why-care" 
            />
          </div>

          <div className="space-y-2">
            <Label>Resources Needed</Label>
            <Input 
              {...form.register("resourcesNeeded")} 
              placeholder="e.g., $500, 10 hours, a developer friend"
              data-testid="input-resources"
            />
          </div>

          <div className="space-y-3">
            <Label>Time Estimate</Label>
            <RadioGroup
              value={form.watch("timeEstimate") || "days"}
              onValueChange={(v) => form.setValue("timeEstimate", v)}
              className="flex flex-wrap gap-2"
            >
              {TIME_ESTIMATES.map((time) => (
                <div key={time}>
                  <RadioGroupItem value={time} id={`time-${time}`} className="peer sr-only" />
                  <Label
                    htmlFor={`time-${time}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-violet-500 peer-data-[state=checked]:bg-violet-500/10 hover-elevate"
                    data-testid={`radio-time-${time}`}
                  >
                    <Clock className="w-3 h-3" />
                    {time.charAt(0).toUpperCase() + time.slice(1)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Excitement & Feasibility Sliders */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Excitement</Label>
                <span className="text-sm font-mono text-violet-400">{form.watch("excitement") || 5}/10</span>
              </div>
              <Slider 
                min={1} max={10} step={1} 
                value={[form.watch("excitement") || 5]} 
                onValueChange={([v]) => form.setValue("excitement", v)}
                data-testid="slider-excitement"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Meh</span>
                <span>On Fire</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Feasibility</Label>
                <span className="text-sm font-mono text-emerald-400">{form.watch("feasibility") || 5}/10</span>
              </div>
              <Slider 
                min={1} max={10} step={1} 
                value={[form.watch("feasibility") || 5]} 
                onValueChange={([v]) => form.setValue("feasibility", v)}
                data-testid="slider-feasibility"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Moonshot</span>
                <span>Easy Win</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tiny Test */}
      <div className="space-y-2">
        <Label>Tiny Test (7 days or less)</Label>
        <Input 
          {...form.register("tinyTest")} 
          placeholder={TINY_TEST_EXAMPLES[Math.floor(Math.random() * TINY_TEST_EXAMPLES.length)]}
          data-testid="input-tiny-test" 
        />
        <p className="text-xs text-muted-foreground">How can you validate this idea quickly without building the whole thing?</p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending} data-testid="button-capture-idea">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
        Capture Idea
      </Button>
    </form>
  );
}

function IdeaList({ filter }: { filter: "draft" | "reality" | "promoted" }) {
  const { data: ideas, isLoading } = useIdeas();
  const { mutate: runCheck, isPending: isChecking } = useRealityCheck();
  const { mutate: updateIdea } = useUpdateIdea();

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;

  const filteredIdeas = ideas?.filter((idea: Idea) => {
    if (filter === "draft") return idea.status === "draft";
    if (filter === "reality") return idea.status === "draft" || idea.status === "parked";
    if (filter === "promoted") return idea.status === "promoted" || idea.status === "shipped";
    return false;
  });

  if (!filteredIdeas?.length) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-xl">
        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground mb-2">No ideas in this stage.</p>
        <p className="text-xs text-muted-foreground/60">Click "New Idea" to capture a spark!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredIdeas.map((idea: Idea) => {
        const CategoryIcon = CATEGORY_ICONS[idea.category || 'tech'] || Lightbulb;
        const categoryColor = CATEGORY_COLORS[idea.category || 'tech'] || '';
        
        return (
          <CardWithBotanical key={idea.id}>
            <Card className="group border-border/30 bg-card/80 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300" data-testid={`card-idea-${idea.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${categoryColor}`}>
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <CardTitle className="font-display truncate">{idea.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={idea.status || 'draft'} />
                      {idea.category && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {idea.category}
                        </Badge>
                      )}
                      {idea.captureMode === "deep" && (
                        <Badge variant="outline" className="text-xs text-violet-400 border-violet-500/30">
                          Deep Dive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {idea.createdAt ? format(new Date(idea.createdAt), "MMM d") : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{idea.pitch}</p>
                
                
                {filter === "reality" && idea.realityCheck != null && (
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs space-y-2">
                    <div className="font-semibold text-violet-400 flex items-center gap-2">
                       <BrainCircuit className="w-3 h-3" /> AI Analysis
                    </div>
                    <p className="line-clamp-3 italic opacity-80">
                      {String((idea.realityCheck as { decision?: string })?.decision ?? "Analysis pending...")}
                    </p>
                  </div>
                )}

                {idea.tinyTest && (
                  <div className="p-2 bg-secondary/30 rounded text-xs">
                    <span className="font-semibold">Tiny Test: </span>
                    <span className="text-muted-foreground">{idea.tinyTest}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t border-border/30 pt-4">
                {filter === "draft" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-500 transition-colors"
                    onClick={() => runCheck(idea.id)}
                    disabled={isChecking}
                    data-testid={`button-reality-check-${idea.id}`}
                  >
                    {isChecking ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <BrainCircuit className="w-3 h-3 mr-2"/>}
                    Run Reality Check
                  </Button>
                )}

                {filter === "reality" && (
                  <div className="flex gap-2 w-full">
                    <Button 
                       variant="secondary" 
                       size="sm" 
                       className="flex-1"
                       onClick={() => updateIdea({ id: idea.id, status: "discarded" })}
                       data-testid={`button-discard-${idea.id}`}
                    >
                      <Archive className="w-3 h-3 mr-2" /> Discard
                    </Button>
                    <Button 
                       variant="default" 
                       size="sm" 
                       className="flex-1"
                       onClick={() => updateIdea({ id: idea.id, status: "promoted" })}
                       data-testid={`button-promote-${idea.id}`}
                    >
                      <Rocket className="w-3 h-3 mr-2" /> Promote
                    </Button>
                  </div>
                )}

                 {filter === "promoted" && (
                  <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-specs-${idea.id}`}>
                    View Specs & Build
                  </Button>
                )}
              </CardFooter>
            </Card>
          </CardWithBotanical>
        );
      })}
    </div>
  );
}

// ==========================================
// BRAINDUMPS PANEL - Voice Transcript Analysis
// ==========================================
function BraindumpsPanel() {
  const { data: transcripts, isLoading } = useTranscripts();
  const { data: stats } = useTranscriptStats();
  const { mutate: createTranscript, isPending: isCreating } = useCreateTranscript();
  const { mutate: analyzeTranscript, isPending: isAnalyzing } = useAnalyzeTranscript();
  const { mutate: deleteTranscript } = useDeleteTranscript();
  
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null);

  const handleUpload = () => {
    if (!title.trim() || !content.trim()) return;
    createTranscript({ title, content }, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setShowUpload(false);
      }
    });
  };

  if (isLoading) {
    return <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Score Summary Card - Like Starcraft post-game */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-card via-card to-violet-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-mono text-lg">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            PATTERN SCORECARD
          </CardTitle>
          <CardDescription className="font-mono text-xs">Session analysis across all braindumps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-3xl font-mono font-bold text-violet-400">{stats?.total || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Sessions</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-3xl font-mono font-bold text-emerald-400">{stats?.analyzed || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Analyzed</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-3xl font-mono font-bold text-cyan-400">{(stats?.totalWords || 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Words</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="text-3xl font-mono font-bold text-amber-400">{stats?.topThemes?.length || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Unique Themes</div>
            </div>
          </div>

          {/* Top Themes */}
          {stats?.topThemes && stats.topThemes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="text-xs font-mono text-muted-foreground mb-2">TOP THEMES</div>
              <div className="flex flex-wrap gap-2">
                {stats.topThemes.slice(0, 8).map((theme: any, i: number) => (
                  <Badge key={i} variant="secondary" className="font-mono">
                    {theme.theme} <span className="ml-1 text-violet-400">x{theme.count}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      <div className="flex justify-between items-center">
        <h3 className="font-mono text-lg text-muted-foreground">Braindump Sessions</h3>
        <Button onClick={() => setShowUpload(!showUpload)} variant={showUpload ? "secondary" : "default"} data-testid="button-upload-transcript">
          <Upload className="w-4 h-4 mr-2" /> {showUpload ? "Cancel" : "Upload Transcript"}
        </Button>
      </div>

      {showUpload && (
        <Card className="border-violet-500/30">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transcript-title">Session Title</Label>
              <Input 
                id="transcript-title"
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Trey & Joe Brainstorm Session"
                data-testid="input-transcript-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transcript-content">Transcript Content</Label>
              <Textarea 
                id="transcript-content"
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your voice transcript here..."
                className="min-h-[200px] font-mono text-sm"
                data-testid="input-transcript-content"
              />
              <p className="text-xs text-muted-foreground">
                {content.split(/\s+/).filter(w => w.length > 0).length} words
              </p>
            </div>
            <Button onClick={handleUpload} disabled={isCreating || !title.trim() || !content.trim()} className="w-full" data-testid="button-save-transcript">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Save Transcript
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Transcript List */}
      {!transcripts?.length ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-2">No braindump sessions yet.</p>
          <p className="text-xs text-muted-foreground/60">Upload a voice transcript to start finding patterns.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transcripts.map((t: any) => (
            <Card key={t.id} className={`border-border/30 ${selectedTranscript?.id === t.id ? 'border-violet-500' : ''}`} data-testid={`card-transcript-${t.id}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base font-display">{t.title}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {t.wordCount?.toLocaleString() || 0} words
                      {t.participants && ` | ${t.participants}`}
                      {t.sessionDate && ` | ${t.sessionDate}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.analyzed ? (
                      <Badge variant="secondary" className="text-emerald-400 border-emerald-500/30">Analyzed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {/* Scorecard if analyzed */}
              {t.analyzed && t.scorecard && (
                <CardContent className="pt-0 pb-2">
                  <div className="grid grid-cols-4 gap-2 text-center p-3 bg-violet-500/5 rounded-lg border border-violet-500/20">
                    <div>
                      <div className="text-lg font-mono font-bold text-violet-400">{t.scorecard.uniqueTopics || 0}</div>
                      <div className="text-[10px] text-muted-foreground">Topics</div>
                    </div>
                    <div>
                      <div className="text-lg font-mono font-bold text-emerald-400">{t.scorecard.actionItems || 0}</div>
                      <div className="text-[10px] text-muted-foreground">Actions</div>
                    </div>
                    <div>
                      <div className="text-lg font-mono font-bold text-cyan-400">{t.scorecard.questions || 0}</div>
                      <div className="text-[10px] text-muted-foreground">Questions</div>
                    </div>
                    <div>
                      <div className="text-lg font-mono font-bold text-amber-400 uppercase">{t.scorecard.energyLevel || '-'}</div>
                      <div className="text-[10px] text-muted-foreground">Energy</div>
                    </div>
                  </div>
                  
                  {/* Top themes from this transcript */}
                  {t.topThemes && t.topThemes.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] font-mono text-muted-foreground mb-1">KEY THEMES</div>
                      <div className="flex flex-wrap gap-1">
                        {t.topThemes.slice(0, 5).map((theme: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {theme.theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}

              <CardFooter className="pt-2 gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTranscript(selectedTranscript?.id === t.id ? null : t)}
                  data-testid={`button-view-transcript-${t.id}`}
                >
                  <FileText className="w-3 h-3 mr-2" /> {selectedTranscript?.id === t.id ? "Hide" : "View"}
                </Button>
                {!t.analyzed && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => analyzeTranscript(t.id)}
                    disabled={isAnalyzing}
                    data-testid={`button-analyze-transcript-${t.id}`}
                  >
                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Play className="w-3 h-3 mr-2" />}
                    Analyze Patterns
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-auto text-destructive"
                  onClick={() => deleteTranscript(t.id)}
                  data-testid={`button-delete-transcript-${t.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardFooter>

              {/* Expanded content view */}
              {selectedTranscript?.id === t.id && (
                <CardContent className="pt-0 border-t border-border/30">
                  <div className="bg-background/50 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {t.content}
                  </div>
                  
                  {/* Pattern details if analyzed */}
                  {t.analyzed && t.patterns && (
                    <div className="mt-4 space-y-3">
                      {Object.entries(t.patterns).map(([category, items]: [string, any]) => (
                        items && items.length > 0 && (
                          <div key={category} className="p-3 bg-violet-500/5 rounded-lg border border-violet-500/20">
                            <div className="text-xs font-mono font-bold text-violet-400 uppercase mb-2">{category}</div>
                            <div className="space-y-1">
                              {items.slice(0, 5).map((item: any, i: number) => (
                                <div key={i} className="text-sm">
                                  <span className="font-medium">{item.text}</span>
                                  {item.quotes?.[0] && (
                                    <span className="text-muted-foreground ml-2 text-xs italic">"{item.quotes[0].slice(0, 50)}..."</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
