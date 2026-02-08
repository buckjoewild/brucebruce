/* ================================================================
   BRUCEOPS - Command Center
   System settings, AI configuration, personal protocols
   Visual: Sensor space with cosmic eye and botanical borders
   ================================================================ */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, Shield, Settings, Brain, Zap, Lock, Sparkles, 
  BarChart3, Activity, Lightbulb, Trees, GraduationCap,
  Bell, Clock, Palette, MessageSquare, Database, Globe,
  Play, RefreshCw, Download, Upload
} from "lucide-react";
import CoreImagery from "@/lib/coreImagery";
import type { DashboardStats } from "@shared/schema";

export default function BruceOps() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTheme, setSelectedTheme] = useState("lab");
  const [selectedTone, setSelectedTone] = useState("balanced");
  const [dailyReminder, setDailyReminder] = useState(true);

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard'],
  });

  const systemModules = [
    {
      title: "AI Intelligence",
      description: "GPT-4o-mini via OpenRouter, personalized with Bruce context",
      icon: Brain,
      status: "Active",
      statusColor: "text-emerald-400"
    },
    {
      title: "Privacy Shield",
      description: "All data user-scoped, no external sharing, local-first",
      icon: Shield,
      status: "Enabled",
      statusColor: "text-emerald-400"
    },
    {
      title: "Session Security",
      description: "PostgreSQL-backed sessions with secure tokens",
      icon: Lock,
      status: "Secured",
      statusColor: "text-emerald-400"
    },
    {
      title: "Theme Engine",
      description: "FIELD / LAB / SANCTUARY adaptive theming",
      icon: Sparkles,
      status: "Active",
      statusColor: "text-emerald-400"
    }
  ];

  const protocols = [
    { name: "Daily Calibration", lane: "LifeOps", frequency: "Daily", enabled: true, icon: Activity },
    { name: "Idea Reality Check", lane: "ThinkOps", frequency: "Per capture", enabled: true, icon: Lightbulb },
    { name: "Drift Detection", lane: "LifeOps", frequency: "Weekly", enabled: true, icon: RefreshCw },
    { name: "Content Generation", lane: "HarrisWildlands", frequency: "On demand", enabled: true, icon: Trees },
    { name: "Lesson Planning", lane: "Teaching", frequency: "As needed", enabled: true, icon: GraduationCap },
  ];

  const quickActions = [
    { name: "Start Daily Log", icon: Play, lane: "LifeOps", path: "/life-ops" },
    { name: "Capture Idea", icon: Lightbulb, lane: "ThinkOps", path: "/think-ops" },
    { name: "Generate Content", icon: Sparkles, lane: "HarrisWildlands", path: "/harris" },
    { name: "Plan Lesson", icon: GraduationCap, lane: "Teaching", path: "/teaching" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header with BruceOps Core Imagery */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${CoreImagery.bruceops})`,
            backgroundPosition: "center 25%"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="relative z-10 p-6 md:p-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center backdrop-blur-sm">
            <Eye className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">BruceOps</h2>
            <p className="text-sm text-muted-foreground tracking-widest uppercase">
              Command Center // System Protocols
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </TabsTrigger>
          <TabsTrigger value="protocols" data-testid="tab-protocols">
            <Zap className="w-4 h-4 mr-2" /> Protocols
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Logs Today</p>
                    <p className="text-2xl font-display font-bold text-emerald-400">{stats?.logsToday || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-emerald-400/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Open Loops</p>
                    <p className="text-2xl font-display font-bold text-violet-400">{stats?.openLoops || 0}</p>
                  </div>
                  <Lightbulb className="w-8 h-8 text-violet-400/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Drift Flags</p>
                    <p className="text-2xl font-display font-bold text-amber-400">{stats?.driftFlags?.length || 0}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-amber-400/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase">AI Calls</p>
                    <p className="text-2xl font-display font-bold text-cyan-400">--</p>
                  </div>
                  <Brain className="w-8 h-8 text-cyan-400/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.name}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 hover:border-cyan-500/50 hover:bg-cyan-500/5"
                    onClick={() => window.location.href = action.path}
                    data-testid={`button-action-${action.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <action.icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs">{action.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemModules.map((module) => (
              <Card 
                key={module.title} 
                className="border-border/30 bg-card/80 backdrop-blur-sm hover:border-cyan-500/30 transition-all"
                data-testid={`card-module-${module.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <module.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-display font-semibold">{module.title}</h3>
                      <span className={`text-xs font-mono ${module.statusColor}`}>{module.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Settings */}
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  AI Configuration
                </CardTitle>
                <CardDescription>Customize how Bruce AI responds to you</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">AI Model</Label>
                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">openai/gpt-4o-mini</span>
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">Active</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Fast, capable, cost-effective</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Response Tone</Label>
                  <RadioGroup
                    value={selectedTone}
                    onValueChange={setSelectedTone}
                    className="space-y-2"
                  >
                    {[
                      { value: "gentle", label: "Gentle", description: "Warm and encouraging" },
                      { value: "balanced", label: "Balanced", description: "Supportive with honest feedback" },
                      { value: "direct", label: "Direct", description: "Straight talk, no fluff" },
                    ].map((tone) => (
                      <div key={tone.value}>
                        <RadioGroupItem value={tone.value} id={`tone-${tone.value}`} className="peer sr-only" />
                        <Label
                          htmlFor={`tone-${tone.value}`}
                          className="flex cursor-pointer items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3 peer-data-[state=checked]:border-violet-500 peer-data-[state=checked]:bg-violet-500/10 hover-elevate"
                          data-testid={`radio-tone-${tone.value}`}
                        >
                          <div>
                            <span className="font-medium">{tone.label}</span>
                            <p className="text-xs text-muted-foreground">{tone.description}</p>
                          </div>
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize your visual experience</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Theme Mode</Label>
                  <RadioGroup
                    value={selectedTheme}
                    onValueChange={setSelectedTheme}
                    className="grid grid-cols-3 gap-2"
                  >
                    {[
                      { value: "field", label: "Field", color: "bg-emerald-500" },
                      { value: "lab", label: "Lab", color: "bg-cyan-500" },
                      { value: "sanctuary", label: "Sanctuary", color: "bg-amber-500" },
                    ].map((theme) => (
                      <div key={theme.value}>
                        <RadioGroupItem value={theme.value} id={`theme-${theme.value}`} className="peer sr-only" />
                        <Label
                          htmlFor={`theme-${theme.value}`}
                          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-border/50 bg-secondary/20 p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover-elevate"
                          data-testid={`radio-theme-${theme.value}`}
                        >
                          <div className={`w-6 h-6 rounded-full ${theme.color} mb-2`} />
                          <span className="text-sm font-medium">{theme.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Notifications</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/30">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium">Daily Reminder</span>
                          <p className="text-xs text-muted-foreground">Prompt for morning calibration</p>
                        </div>
                      </div>
                      <Switch 
                        checked={dailyReminder} 
                        onCheckedChange={setDailyReminder}
                        data-testid="switch-daily-reminder"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm md:col-span-2">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Your data, your control</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary/20 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      <span className="font-medium">Privacy Mode</span>
                    </div>
                    <p className="text-xs text-muted-foreground">All data encrypted and user-scoped. Nothing shared externally.</p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium">Export Data</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Download all your logs, ideas, and content as JSON.</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full" data-testid="button-export">
                      Export
                    </Button>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="w-5 h-5 text-violet-400" />
                      <span className="font-medium">Connected Services</span>
                    </div>
                    <p className="text-xs text-muted-foreground">OpenRouter API for AI intelligence.</p>
                    <Badge variant="outline" className="mt-3 text-emerald-400 border-emerald-500/30">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="protocols" className="mt-6 space-y-6">
          {/* Active Protocols */}
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Active Protocols
                </CardTitle>
                <Button variant="outline" size="sm" data-testid="button-add-protocol">
                  Add Protocol
                </Button>
              </div>
              <CardDescription>Automated routines and intelligence workflows</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {protocols.map((protocol, i) => (
                  <div 
                    key={i} 
                    className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/10 transition-colors"
                    data-testid={`row-protocol-${i}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <protocol.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <span className="font-medium">{protocol.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{protocol.lane}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {protocol.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Switch checked={protocol.enabled} data-testid={`switch-protocol-${i}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm tracking-wide uppercase">System Configuration</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Version</p>
                  <p className="font-mono">BRUCE.OS v2.0</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">AI Model</p>
                  <p className="font-mono">gpt-4o-mini</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Database</p>
                  <p className="font-mono">PostgreSQL</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Auth</p>
                  <p className="font-mono">Replit OIDC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase">
          Private by default // Faithful intelligence // Built for Bruce
        </p>
      </div>
    </div>
  );
}
