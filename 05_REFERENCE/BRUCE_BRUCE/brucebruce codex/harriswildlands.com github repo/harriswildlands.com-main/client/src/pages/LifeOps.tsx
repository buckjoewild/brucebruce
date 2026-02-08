/* ================================================================
   LIFEOPS - Stewardship Lane
   Daily calibration, routines, logs, family leadership
   Visual: Regeneration Field with bioluminescent fungi & aurora
   Target: 1-2 minutes to complete
   ================================================================ */

import { useState, useEffect } from "react";
import { useLogs, useCreateLog, useLogByDate, useUpdateLog } from "@/hooks/use-bruce-ops";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLogSchema, DAY_TYPES, PRIMARY_EMOTIONS, WIN_CATEGORIES, TIME_DRAINS, type Log } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Lightbulb, Activity, ChevronDown, Wine, Cigarette, Cookie, Smartphone, Moon, Coffee, UtensilsCrossed, Dumbbell } from "lucide-react";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import CoreImagery, { LaneBg } from "@/lib/coreImagery";

type LogFormValues = z.infer<typeof insertLogSchema>;

const SCALE_LABELS = {
  energy: { low: "Crashed", high: "Unstoppable", color: "text-emerald-400" },
  stress: { low: "Zen", high: "Maxed Out", color: "text-red-400" },
  mood: { low: "Dark", high: "Grateful", color: "text-amber-400" },
  focus: { low: "Scattered", high: "Locked In", color: "text-violet-400" },
  sleepQuality: { low: "Terrible", high: "Restorative", color: "text-blue-400" },
  moneyPressure: { low: "Stable", high: "Crushing", color: "text-yellow-500" },
  connection: { low: "Isolated", high: "Deeply Connected", color: "text-pink-400" },
};

const VICE_ITEMS = [
  { key: "vaping", label: "Vaping", icon: Cigarette, description: "Did you vape today?" },
  { key: "alcohol", label: "Alcohol", icon: Wine, description: "Any drinks today?" },
  { key: "junkFood", label: "Junk Food", icon: Cookie, description: "Processed/fast food?" },
  { key: "doomScrolling", label: "Doom Scroll", icon: Smartphone, description: "Wasted time scrolling?" },
  { key: "lateScreens", label: "Late Screens", icon: Moon, description: "Screens after 10pm?" },
  { key: "skippedMeals", label: "Skipped Meals", icon: UtensilsCrossed, description: "Missed proper meals?" },
  { key: "excessCaffeine", label: "Excess Caffeine", icon: Coffee, description: "Too much coffee?" },
] as const;

const PROMPT_EXAMPLES = {
  topWin: [
    "Finished the project proposal",
    "Great conversation with my kid", 
    "30 min workout before work",
    "Stayed calm in a stressful meeting"
  ],
  topFriction: [
    "Procrastinated on taxes",
    "Snapped at my spouse",
    "Couldn't focus all morning",
    "Skipped my morning routine"
  ],
  tomorrowPriority: [
    "Submit quarterly report",
    "Call mom",
    "Morning workout no excuses",
    "Finish reading that chapter"
  ]
};

export default function LifeOps() {
  return (
    <div className="relative min-h-full">
      {/* Persistent faint background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.root2})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        {/* Hero Header with MS-DOS Console Styling - Root Theme */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.root2})`,
              backgroundPosition: "center 30%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
          
          <div className="relative z-10 p-6 md:p-8">
            <div className="bg-black/70 border border-amber-600/40 p-4 md:p-6 backdrop-blur-md inline-block">
              <p className="font-mono text-amber-500/80 text-xs mb-1 tracking-wider">lifeops@root:~$</p>
              <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-amber-400 uppercase">
                LIFE_OPS<span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-amber-500/70 text-xs mt-3 tracking-wide">
                &gt; stewardship channel // daily calibration
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="log" data-testid="tab-daily-log">Daily Log</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History & Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="mt-6">
          <DailyLogForm />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <LogHistory />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DailyLogForm() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: existingLog, isLoading: checkingExisting } = useLogByDate(today);
  const { mutate: createLog, isPending: isCreating } = useCreateLog();
  const { mutate: updateLog, isPending: isUpdating } = useUpdateLog();
  
  const [deepDivesOpen, setDeepDivesOpen] = useState(false);
  const [quickMode, setQuickMode] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const isEditMode = !!existingLog?.id;
  const isPending = isCreating || isUpdating;
  
  const defaultValues: LogFormValues = {
    date: today,
    energy: 5,
    stress: 5,
    mood: 5,
    focus: 5,
    sleepQuality: 5,
    moneyPressure: 5,
    connection: 5,
    vaping: false,
    alcohol: false,
    junkFood: false,
    doomScrolling: false,
    lateScreens: false,
    skippedMeals: false,
    excessCaffeine: false,
    exercise: false,
    dayType: "work",
    primaryEmotion: "peaceful",
    winCategory: "none",
    timeDrain: "none",
  };
  
  const form = useForm<LogFormValues>({
    resolver: zodResolver(insertLogSchema),
    defaultValues,
  });

  useEffect(() => {
    if (existingLog) {
      const logData = {
        ...defaultValues,
        ...existingLog,
      };
      form.reset(logData);
    }
  }, [existingLog]);

  const onSubmit = (data: LogFormValues) => {
    setSaveSuccess(false);
    
    const handleSuccess = () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    };
    
    const handleError = () => {
      setSaveSuccess(false);
    };
    
    if (isEditMode && existingLog?.id) {
      updateLog({ ...data, id: existingLog.id }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createLog(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  if (checkingExisting) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CardWithBotanical className="max-w-4xl">
      <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="text-lg flex items-center flex-wrap gap-2">
            <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
            <span>{isEditMode ? 'Update Today\'s Log' : 'Daily Calibration'}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {format(new Date(), "MMM d, yyyy")}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className={quickMode ? 'text-muted-foreground' : 'text-foreground font-medium'}>Full</span>
                <Switch 
                  checked={quickMode}
                  onCheckedChange={setQuickMode}
                  data-testid="switch-quick-mode"
                />
                <span className={quickMode ? 'text-foreground font-medium' : 'text-muted-foreground'}>Quick</span>
              </div>
              <span className="text-xs font-normal text-muted-foreground">{quickMode ? '~1 min' : '~3 min'}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SECTION 1: VICES CHECK */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-400">1</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Vices Check</h3>
                <span className="text-xs text-muted-foreground">(Yes = did it today)</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {VICE_ITEMS.map((vice) => (
                  <div 
                    key={vice.key}
                    className={`p-3 rounded-lg border transition-all ${
                      form.watch(vice.key as keyof LogFormValues) 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-secondary/20 border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <vice.icon className={`w-4 h-4 shrink-0 ${
                          form.watch(vice.key as keyof LogFormValues) ? 'text-red-400' : 'text-muted-foreground'
                        }`} />
                        <span className="text-sm font-medium truncate">{vice.label}</span>
                      </div>
                      <Switch 
                        checked={form.watch(vice.key as keyof LogFormValues) as boolean || false}
                        onCheckedChange={(c) => form.setValue(vice.key as any, c)}
                        data-testid={`switch-${vice.key}`}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Exercise is positive - styled differently */}
                <div 
                  className={`p-3 rounded-lg border transition-all ${
                    form.watch("exercise") 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-secondary/20 border-border/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Dumbbell className={`w-4 h-4 shrink-0 ${
                        form.watch("exercise") ? 'text-emerald-400' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm font-medium truncate">Exercise</span>
                    </div>
                    <Switch 
                      checked={form.watch("exercise") || false}
                      onCheckedChange={(c) => form.setValue("exercise", c)}
                      data-testid="switch-exercise"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: LIFE METRICS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-400">2</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Life Metrics</h3>
                <span className="text-xs text-muted-foreground">(1-10 scale)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(SCALE_LABELS).map(([key, labels]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <span className={`font-mono font-bold ${labels.color}`}>
                        {form.watch(key as keyof LogFormValues) || 5}
                      </span>
                    </div>
                    <Slider 
                      min={1} max={10} step={1} 
                      value={[form.watch(key as keyof LogFormValues) as number || 5]} 
                      onValueChange={([v]) => form.setValue(key as any, v)}
                      className="py-2"
                      data-testid={`slider-${key}`}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{labels.low}</span>
                      <span>{labels.high}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTIONS 3-5: Only show when NOT in quick mode */}
            {!quickMode && (
            <>
            {/* SECTION 3: QUICK CONTEXT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-400">3</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Context</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Day Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">What kind of day was it?</Label>
                  <RadioGroup
                    value={form.watch("dayType") || "work"}
                    onValueChange={(v) => form.setValue("dayType", v)}
                    className="flex flex-wrap gap-2"
                  >
                    {DAY_TYPES.map((type) => (
                      <div key={type}>
                        <RadioGroupItem value={type} id={`day-${type}`} className="peer sr-only" />
                        <Label
                          htmlFor={`day-${type}`}
                          className="flex cursor-pointer items-center rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover-elevate"
                          data-testid={`radio-day-${type}`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Primary Emotion */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Primary emotion today?</Label>
                  <RadioGroup
                    value={form.watch("primaryEmotion") || "peaceful"}
                    onValueChange={(v) => form.setValue("primaryEmotion", v)}
                    className="flex flex-wrap gap-2"
                  >
                    {PRIMARY_EMOTIONS.map((emotion) => (
                      <div key={emotion}>
                        <RadioGroupItem value={emotion} id={`emotion-${emotion}`} className="peer sr-only" />
                        <Label
                          htmlFor={`emotion-${emotion}`}
                          className="flex cursor-pointer items-center rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover-elevate"
                          data-testid={`radio-emotion-${emotion}`}
                        >
                          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Win Category */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Biggest win category?</Label>
                  <RadioGroup
                    value={form.watch("winCategory") || "none"}
                    onValueChange={(v) => form.setValue("winCategory", v)}
                    className="flex flex-wrap gap-2"
                  >
                    {WIN_CATEGORIES.map((cat) => (
                      <div key={cat}>
                        <RadioGroupItem value={cat} id={`win-${cat}`} className="peer sr-only" />
                        <Label
                          htmlFor={`win-${cat}`}
                          className="flex cursor-pointer items-center rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 peer-data-[state=checked]:text-emerald-500 hover-elevate"
                          data-testid={`radio-win-${cat}`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Time Drain */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Biggest time drain?</Label>
                  <RadioGroup
                    value={form.watch("timeDrain") || "none"}
                    onValueChange={(v) => form.setValue("timeDrain", v)}
                    className="flex flex-wrap gap-2"
                  >
                    {TIME_DRAINS.map((drain) => (
                      <div key={drain}>
                        <RadioGroupItem value={drain} id={`drain-${drain}`} className="peer sr-only" />
                        <Label
                          htmlFor={`drain-${drain}`}
                          className="flex cursor-pointer items-center rounded-md border border-border/50 bg-secondary/20 px-3 py-1.5 text-sm peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 peer-data-[state=checked]:text-orange-500 hover-elevate"
                          data-testid={`radio-drain-${drain}`}
                        >
                          {drain.charAt(0).toUpperCase() + drain.slice(1).replace(/-/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* SECTION 4: REFLECTION PROMPTS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-400">4</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Reflections</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Top Win</Label>
                  <Input 
                    {...form.register("topWin")} 
                    placeholder={PROMPT_EXAMPLES.topWin[Math.floor(Math.random() * PROMPT_EXAMPLES.topWin.length)]}
                    data-testid="input-top-win" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Top Friction</Label>
                  <Input 
                    {...form.register("topFriction")} 
                    placeholder={PROMPT_EXAMPLES.topFriction[Math.floor(Math.random() * PROMPT_EXAMPLES.topFriction.length)]}
                    data-testid="input-top-friction" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tomorrow's ONE Thing</Label>
                  <Input 
                    {...form.register("tomorrowPriority")} 
                    placeholder={PROMPT_EXAMPLES.tomorrowPriority[Math.floor(Math.random() * PROMPT_EXAMPLES.tomorrowPriority.length)]}
                    data-testid="input-tomorrow" 
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: OPTIONAL DEEP DIVES */}
            <Collapsible open={deepDivesOpen} onOpenChange={setDeepDivesOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full justify-between text-muted-foreground"
                  data-testid="button-toggle-deep-dives"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-400">5</span>
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-wider">Optional Deep Dives</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${deepDivesOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Family Connection</Label>
                  <Textarea 
                    {...form.register("familyConnection")} 
                    placeholder="A meaningful moment with family today... (e.g., 'Read bedtime story to kids', 'Long talk with spouse about goals')"
                    className="h-20" 
                    data-testid="textarea-family" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Faith Alignment</Label>
                  <Textarea 
                    {...form.register("faithAlignment")} 
                    placeholder="How did faith show up today? (e.g., 'Morning prayer felt grounded', 'Struggled to trust God with finances')"
                    className="h-20" 
                    data-testid="textarea-faith" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Drift Check</Label>
                  <Textarea 
                    {...form.register("driftCheck")} 
                    placeholder="Where am I drifting off course? (e.g., 'Spending too much time on phone', 'Avoiding hard conversations')"
                    className="h-20 border-destructive/20 focus-visible:ring-destructive/50" 
                    data-testid="textarea-drift"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            </>
            )}

            <Button 
              type="submit" 
              className={`w-full transition-all ${saveSuccess ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`} 
              disabled={isPending} 
              data-testid="button-save-log"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Saved
                </>
              ) : isEditMode ? "Update Log" : "Save Daily Log"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </CardWithBotanical>
  );
}

function generateInsight(log: Log): { title: string; insight: string; citations: string[] } {
  const viceCount = [log.vaping, log.alcohol, log.junkFood, log.doomScrolling, log.lateScreens, log.skippedMeals, log.excessCaffeine].filter(Boolean).length;
  const avgMetrics = ((log.energy || 5) + (log.mood || 5) + (log.focus || 5)) / 3;
  const citations: string[] = [];
  
  if (log.exercise && avgMetrics >= 7) {
    citations.push(`Energy: ${log.energy}/10`);
    citations.push(`Mood: ${log.mood}/10`);
    if (log.topWin) citations.push(`Win: "${log.topWin}"`);
    return {
      title: "Strong Day Pattern",
      insight: `Exercise combined with high energy and positive mood suggests your physical activity is a keystone habit. Days when you exercise show significantly better metrics across the board.`,
      citations
    };
  }
  
  if (viceCount >= 4 && (log.stress || 5) >= 6) {
    citations.push(`Stress: ${log.stress}/10`);
    citations.push(`Vices triggered: ${viceCount}`);
    if (log.driftCheck) citations.push(`Drift: "${log.driftCheck}"`);
    return {
      title: "Stress-Vice Correlation",
      insight: `High stress days correlate with multiple vice triggers. When stress exceeds 6, you're more likely to reach for coping mechanisms. Consider pre-planning stress responses.`,
      citations
    };
  }
  
  if (log.dayType === "family" && (log.connection || 5) >= 8) {
    citations.push(`Connection: ${log.connection}/10`);
    if (log.familyConnection) citations.push(`Family: "${log.familyConnection}"`);
    citations.push(`Day Type: ${log.dayType}`);
    return {
      title: "Family Days Boost Connection",
      insight: `Your family-focused days consistently show high connection scores. This alignment with your values appears to be a significant source of wellbeing.`,
      citations
    };
  }
  
  if ((log.sleepQuality || 5) <= 4 && (log.energy || 5) <= 4) {
    citations.push(`Sleep Quality: ${log.sleepQuality}/10`);
    citations.push(`Energy: ${log.energy}/10`);
    if (log.lateScreens) citations.push(`Late screens: Yes`);
    return {
      title: "Sleep-Energy Link",
      insight: `Poor sleep quality directly impacts next-day energy. Late screen use may be a contributing factor. Consider a wind-down routine without devices.`,
      citations
    };
  }
  
  if (log.primaryEmotion === "overwhelmed" || log.dayType === "chaos") {
    citations.push(`Emotion: ${log.primaryEmotion}`);
    citations.push(`Day Type: ${log.dayType}`);
    if (log.topFriction) citations.push(`Friction: "${log.topFriction}"`);
    return {
      title: "Reset Needed",
      insight: `Chaos days happen. The key pattern shows recovery is faster when you name it explicitly and plan one reset action for tomorrow.`,
      citations
    };
  }
  
  if (log.exercise && log.faithAlignment) {
    citations.push(`Exercise: Yes`);
    citations.push(`Faith: "${log.faithAlignment}"`);
    return {
      title: "Mind-Body-Spirit Alignment",
      insight: `Days with both physical activity and faith practice show your highest overall wellbeing scores. This combination appears to be your optimal rhythm.`,
      citations
    };
  }
  
  citations.push(`Energy: ${log.energy}/10`);
  citations.push(`Mood: ${log.mood}/10`);
  if (log.topWin) citations.push(`Win: "${log.topWin}"`);
  return {
    title: "Daily Snapshot",
    insight: `Tracking creates awareness. Review your patterns weekly to identify what moves the needle for you.`,
    citations
  };
}

const EXAMPLE_LOGS: Log[] = [
  {
    id: 1, date: "2025-12-21", userId: "example",
    vaping: false, alcohol: false, junkFood: false, doomScrolling: false, lateScreens: false, skippedMeals: false, excessCaffeine: false, exercise: true,
    energy: 8, stress: 3, mood: 9, focus: 8, sleepQuality: 8, sleepHours: 7, moneyPressure: 2, connection: 9,
    dayType: "family", primaryEmotion: "grateful", winCategory: "family", timeDrain: "none",
    topWin: "Quality time with kids building a fort", topFriction: "Minor work email distraction", tomorrowPriority: "Finish quarterly budget review",
    familyConnection: "Built a blanket fort with the kids and told stories for an hour", faithAlignment: "Morning devotional felt deeply connected", driftCheck: null,
    rawTranscript: null, aiSummary: null, createdAt: null
  },
  {
    id: 2, date: "2025-12-22", userId: "example",
    vaping: false, alcohol: true, junkFood: true, doomScrolling: true, lateScreens: true, skippedMeals: false, excessCaffeine: true, exercise: false,
    energy: 4, stress: 8, mood: 4, focus: 3, sleepQuality: 4, sleepHours: 5, moneyPressure: 6, connection: 3,
    dayType: "work", primaryEmotion: "anxious", winCategory: "work", timeDrain: "meetings",
    topWin: "Closed the Henderson deal despite obstacles", topFriction: "Back-to-back meetings killed focus", tomorrowPriority: "Protect morning focus time",
    familyConnection: null, faithAlignment: "Struggled to find peace during the day", driftCheck: "Letting work stress bleed into home time",
    rawTranscript: null, aiSummary: null, createdAt: null
  },
  {
    id: 3, date: "2025-12-23", userId: "example",
    vaping: false, alcohol: false, junkFood: false, doomScrolling: false, lateScreens: false, skippedMeals: false, excessCaffeine: false, exercise: true,
    energy: 6, stress: 4, mood: 7, focus: 6, sleepQuality: 7, sleepHours: 8, moneyPressure: 3, connection: 7,
    dayType: "rest", primaryEmotion: "peaceful", winCategory: "health", timeDrain: "none",
    topWin: "Morning run cleared my head completely", topFriction: "Tempted to check work email", tomorrowPriority: "Meal prep for the week",
    familyConnection: "Long walk with spouse discussing 2026 goals", faithAlignment: "Journaled for 20 minutes on gratitude", driftCheck: null,
    rawTranscript: null, aiSummary: null, createdAt: null
  },
  {
    id: 4, date: "2025-12-24", userId: "example",
    vaping: true, alcohol: false, junkFood: true, doomScrolling: false, lateScreens: false, skippedMeals: false, excessCaffeine: true, exercise: false,
    energy: 5, stress: 5, mood: 6, focus: 5, sleepQuality: 5, sleepHours: 6, moneyPressure: 4, connection: 6,
    dayType: "mixed", primaryEmotion: "hopeful", winCategory: "creative", timeDrain: "distractions",
    topWin: "Finished first draft of blog post", topFriction: "Vaped twice when stressed", tomorrowPriority: "Christmas morning presence over presents",
    familyConnection: "Wrapped gifts together as a family", faithAlignment: "Christmas Eve service was meaningful", driftCheck: "Snacking mindlessly while working",
    rawTranscript: null, aiSummary: null, createdAt: null
  },
  {
    id: 5, date: "2025-12-25", userId: "example",
    vaping: false, alcohol: false, junkFood: false, doomScrolling: false, lateScreens: false, skippedMeals: false, excessCaffeine: false, exercise: true,
    energy: 9, stress: 2, mood: 10, focus: 7, sleepQuality: 9, sleepHours: 8, moneyPressure: 1, connection: 10,
    dayType: "family", primaryEmotion: "grateful", winCategory: "family", timeDrain: "none",
    topWin: "Kids faces opening gifts - priceless", topFriction: "None - stayed fully present", tomorrowPriority: "Thank you notes with kids",
    familyConnection: "All day with extended family, felt deeply connected", faithAlignment: "Led family prayer before dinner, felt honored", driftCheck: null,
    rawTranscript: null, aiSummary: null, createdAt: null
  },
  {
    id: 6, date: "2025-12-26", userId: "example",
    vaping: true, alcohol: true, junkFood: true, doomScrolling: true, lateScreens: true, skippedMeals: true, excessCaffeine: true, exercise: false,
    energy: 2, stress: 7, mood: 3, focus: 2, sleepQuality: 3, sleepHours: 4, moneyPressure: 5, connection: 4,
    dayType: "chaos", primaryEmotion: "overwhelmed", winCategory: "none", timeDrain: "low-energy",
    topWin: "Made it through the day", topFriction: "Everything felt hard, no energy", tomorrowPriority: "Reset with early bedtime",
    familyConnection: "Kids noticed I was off, tried to cheer me up", faithAlignment: "Forgot to pray, felt disconnected", driftCheck: "Completely off track with all habits",
    rawTranscript: null, aiSummary: null, createdAt: null
  },
  {
    id: 7, date: "2025-12-27", userId: "example",
    vaping: false, alcohol: false, junkFood: false, doomScrolling: false, lateScreens: false, skippedMeals: false, excessCaffeine: false, exercise: true,
    energy: 7, stress: 4, mood: 8, focus: 7, sleepQuality: 7, sleepHours: 7, moneyPressure: 3, connection: 8,
    dayType: "work", primaryEmotion: "hopeful", winCategory: "health", timeDrain: "interruptions",
    topWin: "Morning workout restored my energy", topFriction: "Few interruptions broke flow", tomorrowPriority: "Weekly planning session",
    familyConnection: "Apologized to kids for being distant yesterday", faithAlignment: "Back to morning routine, felt grounded", driftCheck: "Need to protect sleep more",
    rawTranscript: null, aiSummary: null, createdAt: null
  }
];

function LogHistory() {
  const { data: userLogs, isLoading } = useLogs();
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showExamples, setShowExamples] = useState(true);

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;

  const hasUserLogs = userLogs && userLogs.length > 0;
  const logs = hasUserLogs ? userLogs : (showExamples ? EXAMPLE_LOGS : []);
  
  if (!logs.length) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">No logs yet. Start your daily calibration above.</p>
      </div>
    );
  }

  const avgEnergy = logs.reduce((sum: number, l: Log) => sum + (l.energy || 5), 0) / logs.length;
  const avgStress = logs.reduce((sum: number, l: Log) => sum + (l.stress || 5), 0) / logs.length;
  const exerciseDays = logs.filter((l: Log) => l.exercise).length;
  const exerciseRate = Math.round((exerciseDays / logs.length) * 100);
  const isShowingExamples = !hasUserLogs && showExamples;

  return (
    <div className="space-y-6">
      {/* Example Data Banner */}
      {isShowingExamples && (
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10" data-testid="banner-example-data">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium">Viewing Example Data</span>
              <span className="text-xs text-muted-foreground">See how the system works with sample logs from a week of tracking</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowExamples(false)}
              data-testid="button-hide-examples"
            >
              Hide Examples
            </Button>
          </div>
        </div>
      )}
      
      {/* Weekly Summary Card */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent" data-testid="card-weekly-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-emerald-400" />
            Weekly Insights ({logs.length} days logged)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className="text-xs text-muted-foreground uppercase">Avg Energy</div>
              <div className="text-2xl font-bold text-emerald-400">{avgEnergy.toFixed(1)}</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className="text-xs text-muted-foreground uppercase">Avg Stress</div>
              <div className="text-2xl font-bold text-red-400">{avgStress.toFixed(1)}</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className="text-xs text-muted-foreground uppercase">Exercise Rate</div>
              <div className="text-2xl font-bold text-violet-400">{exerciseRate}%</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className="text-xs text-muted-foreground uppercase">Days Logged</div>
              <div className="text-2xl font-bold text-amber-400">{logs.length}</div>
            </div>
          </div>
          
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold">Pattern Detected:</span> Your energy is {avgEnergy > 6 ? "consistently strong" : avgEnergy < 4 ? "struggling" : "moderate"}. 
                {exerciseRate >= 50 
                  ? ` Exercise on ${exerciseRate}% of days correlates with your best metrics.` 
                  : ` Increasing exercise frequency (currently ${exerciseRate}%) may boost overall energy.`}
                <span className="block mt-1 text-xs text-muted-foreground">
                  Based on {logs.length} logged days
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Day Cards */}
      {logs?.map((log: Log) => {
        const insight = generateInsight(log);
        const isExpanded = selectedLog?.id === log.id;
        
        return (
          <Card 
            key={log.id} 
            className={`overflow-hidden border-border/40 transition-all backdrop-blur-sm cursor-pointer ${isExpanded ? 'border-primary/50 ring-1 ring-primary/20' : 'hover:border-emerald-500/30'}`} 
            data-testid={`card-log-${log.id}`}
            onClick={() => setSelectedLog(isExpanded ? null : log)}
          >
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:w-64 bg-secondary/30 border-b md:border-b-0 md:border-r border-border/40 flex flex-col justify-center space-y-4">
                <div className="text-2xl font-display font-bold">{format(new Date(log.date), "MMM d, yyyy")}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                     <span className="text-muted-foreground text-xs uppercase">Energy</span>
                     <span className="font-mono font-bold text-emerald-400">{log.energy}/10</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-muted-foreground text-xs uppercase">Stress</span>
                     <span className="font-mono font-bold text-red-400">{log.stress}/10</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-muted-foreground text-xs uppercase">Mood</span>
                     <span className="font-mono font-bold text-amber-400">{log.mood}/10</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-muted-foreground text-xs uppercase">Focus</span>
                     <span className="font-mono font-bold text-violet-400">{log.focus}/10</span>
                  </div>
                </div>
                {log.dayType && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Day Type: </span>
                    <span className="capitalize">{log.dayType}</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 space-y-4">
                 {/* Generated Insight */}
                 <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-sm leading-relaxed">
                   <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                     <Lightbulb className="w-4 h-4" /> {insight.title}
                   </div>
                   <p>{insight.insight}</p>
                   <div className="mt-3 pt-3 border-t border-border/30">
                     <span className="text-xs text-muted-foreground">Evidence: </span>
                     <span className="text-xs">{insight.citations.join(" | ")}</span>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="font-semibold block mb-1">Win</span>
                     <p className="text-muted-foreground">{log.topWin || "-"}</p>
                   </div>
                   <div>
                     <span className="font-semibold block mb-1">Friction</span>
                     <p className="text-muted-foreground">{log.topFriction || "-"}</p>
                   </div>
                 </div>
                 
                 {/* Vice summary */}
                 <div className="flex flex-wrap gap-2 text-xs">
                   {log.vaping && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Vaping</span>}
                   {log.alcohol && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Alcohol</span>}
                   {log.junkFood && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Junk Food</span>}
                   {log.doomScrolling && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Doom Scroll</span>}
                   {log.lateScreens && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">Late Screens</span>}
                   {log.excessCaffeine && <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">Excess Caffeine</span>}
                   {log.exercise && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Exercise</span>}
                 </div>
                 
                 {/* Expanded Details */}
                 {isExpanded && (
                   <div className="pt-4 mt-4 border-t border-border/30 space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                       <div>
                         <span className="text-muted-foreground text-xs uppercase block">Sleep Quality</span>
                         <span className="font-mono font-bold text-blue-400">{log.sleepQuality}/10</span>
                       </div>
                       <div>
                         <span className="text-muted-foreground text-xs uppercase block">Sleep Hours</span>
                         <span className="font-mono font-bold">{log.sleepHours || "-"}h</span>
                       </div>
                       <div>
                         <span className="text-muted-foreground text-xs uppercase block">Money Pressure</span>
                         <span className="font-mono font-bold text-yellow-500">{log.moneyPressure}/10</span>
                       </div>
                       <div>
                         <span className="text-muted-foreground text-xs uppercase block">Connection</span>
                         <span className="font-mono font-bold text-pink-400">{log.connection}/10</span>
                       </div>
                     </div>
                     
                     {(log.familyConnection || log.faithAlignment || log.driftCheck) && (
                       <div className="space-y-3">
                         {log.familyConnection && (
                           <div>
                             <span className="font-semibold text-sm block mb-1">Family Connection</span>
                             <p className="text-sm text-muted-foreground">{log.familyConnection}</p>
                           </div>
                         )}
                         {log.faithAlignment && (
                           <div>
                             <span className="font-semibold text-sm block mb-1">Faith Alignment</span>
                             <p className="text-sm text-muted-foreground">{log.faithAlignment}</p>
                           </div>
                         )}
                         {log.driftCheck && (
                           <div>
                             <span className="font-semibold text-sm block mb-1">Drift Check</span>
                             <p className="text-sm text-muted-foreground">{log.driftCheck}</p>
                           </div>
                         )}
                       </div>
                     )}
                     
                     {log.tomorrowPriority && (
                       <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                         <span className="text-xs uppercase text-emerald-400 block mb-1">Tomorrow's Priority</span>
                         <p className="text-sm">{log.tomorrowPriority}</p>
                       </div>
                     )}
                   </div>
                 )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
