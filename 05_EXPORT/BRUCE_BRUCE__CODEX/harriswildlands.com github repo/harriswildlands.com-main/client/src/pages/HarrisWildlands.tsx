/* ================================================================
   HARRIS WILDLANDS - Build Lane
   Website content, creative output, public work
   Visual: Aurora forest with bioluminescent botanicals
   ================================================================ */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHarrisContentSchema, CONTENT_TYPES, CONTENT_TONES } from "@shared/schema";
import { useCreateHarrisContent } from "@/hooks/use-bruce-ops";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trees, Sparkles, LayoutTemplate, Globe, Share2, Mail, FileText, Video, Lightbulb, GraduationCap, Heart, Briefcase, Copy, Check } from "lucide-react";
import { CardWithBotanical } from "@/components/BotanicalMotifs";
import CoreImagery, { LaneBg } from "@/lib/coreImagery";

type HarrisFormValues = z.infer<typeof insertHarrisContentSchema>;

const CONTENT_TYPE_CONFIG = {
  website: { icon: Globe, label: "Website Copy", description: "Home, About, Services pages" },
  social: { icon: Share2, label: "Social Posts", description: "Twitter/X, LinkedIn, Instagram" },
  email: { icon: Mail, label: "Email Sequence", description: "Welcome series, newsletters" },
  blog: { icon: FileText, label: "Blog Outline", description: "Article structure & hooks" },
  video: { icon: Video, label: "Video Script", description: "YouTube, course content" },
};

const TONE_CONFIG = {
  inspirational: { icon: Lightbulb, label: "Inspirational", description: "Uplifting & motivating" },
  educational: { icon: GraduationCap, label: "Educational", description: "Clear & informative" },
  personal: { icon: Heart, label: "Personal", description: "Vulnerable & authentic" },
  professional: { icon: Briefcase, label: "Professional", description: "Polished & authoritative" },
};

const TEMPLATES = {
  website: [
    { name: "Landing Page", description: "Hero + benefits + CTA" },
    { name: "About Story", description: "Personal journey + mission" },
    { name: "Services Page", description: "What you offer + pricing hints" },
  ],
  social: [
    { name: "Thread Hook", description: "Viral thread opener" },
    { name: "Value Post", description: "Teach something useful" },
    { name: "Personal Story", description: "Relatable experience" },
  ],
  email: [
    { name: "Welcome Email", description: "First impression + value" },
    { name: "Nurture Sequence", description: "5-email trust builder" },
    { name: "Launch Announcement", description: "Product/service reveal" },
  ],
  blog: [
    { name: "How-To Guide", description: "Step-by-step tutorial" },
    { name: "Listicle", description: "Top X ways/tips/tools" },
    { name: "Opinion Piece", description: "Hot take + reasoning" },
  ],
  video: [
    { name: "YouTube Tutorial", description: "Hook + teach + CTA" },
    { name: "Course Module", description: "Lesson structure" },
    { name: "Talking Head", description: "Personal message script" },
  ],
};

const EXAMPLE_PROMPTS = {
  audience: [
    "Faith-driven fathers building side businesses",
    "Teachers looking to leave the classroom",
    "Overwhelmed parents seeking balance",
  ],
  pain: [
    "Feeling stuck between calling and paycheck",
    "No time for family AND business growth",
    "Confused about where to start online",
  ],
  promise: [
    "Build a business that serves your family's mission",
    "Create sustainable income without sacrificing presence",
    "Find clarity and take the first step today",
  ],
};

export default function HarrisWildlands() {
  const { mutate: generate, isPending, data: result } = useCreateHarrisContent();
  const [activeTab, setActiveTab] = useState("create");
  const [selectedType, setSelectedType] = useState<string>("website");
  const [selectedTone, setSelectedTone] = useState<string>("inspirational");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const form = useForm<HarrisFormValues>({
    resolver: zodResolver(insertHarrisContentSchema),
    defaultValues: {
      contentType: "website",
      tone: "inspirational",
      template: "",
      coreMessage: { definition: "", audience: "", pain: "", promise: "" },
      siteMap: { homeGoal: "", startHereGoal: "", resourcesGoal: "", cta: "" },
      leadMagnet: { title: "", problem: "", timeToValue: "", delivery: "" }
    }
  });

  const onSubmit = (data: HarrisFormValues) => {
    generate({
      ...data,
      contentType: selectedType,
      tone: selectedTone,
      template: selectedTemplate,
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-full">
      {/* Persistent faint background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.harriswildlands2})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        {/* Hero Header with MS-DOS Console Styling - Wildlands Theme */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.harriswildlands})`,
              backgroundPosition: "center 30%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="bg-black/70 border border-emerald-500/40 p-4 md:p-5 backdrop-blur-md inline-block">
            <p className="font-mono text-emerald-400/80 text-xs mb-1 tracking-wider">brand@wildlands:~$</p>
            <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-emerald-300 uppercase">
              HARRIS_WILDLANDS<span className="cursor-blink">_</span>
            </h2>
            <p className="font-mono text-emerald-400/70 text-xs mt-2 tracking-wide">
              &gt; build channel // brand voice &amp; content
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="create" data-testid="tab-create">
            <Sparkles className="w-4 h-4 mr-2" /> Create Content
          </TabsTrigger>
          <TabsTrigger value="library" data-testid="tab-library">
            <LayoutTemplate className="w-4 h-4 mr-2" /> Content Library
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Content Configuration */}
            <CardWithBotanical>
              <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
                <CardHeader className="border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    Content Generator
                  </CardTitle>
                  <CardDescription>Configure your content and let AI do the heavy lifting.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Content Type Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-teal-400">1</span>
                        </div>
                        <Label className="text-sm font-semibold">Content Type</Label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {CONTENT_TYPES.map((type) => {
                          const config = CONTENT_TYPE_CONFIG[type];
                          const isSelected = selectedType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setSelectedType(type);
                                setSelectedTemplate("");
                              }}
                              className={`p-3 rounded-lg border text-left transition-all hover-elevate ${
                                isSelected 
                                  ? 'bg-teal-500/10 border-teal-500/50' 
                                  : 'bg-secondary/20 border-border/50'
                              }`}
                              data-testid={`button-type-${type}`}
                            >
                              <config.icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-teal-400' : 'text-muted-foreground'}`} />
                              <div className="text-sm font-medium">{config.label}</div>
                              <div className="text-[10px] text-muted-foreground">{config.description}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tone Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-teal-400">2</span>
                        </div>
                        <Label className="text-sm font-semibold">Tone</Label>
                      </div>
                      <RadioGroup
                        value={selectedTone}
                        onValueChange={setSelectedTone}
                        className="flex flex-wrap gap-2"
                      >
                        {CONTENT_TONES.map((tone) => {
                          const config = TONE_CONFIG[tone];
                          return (
                            <div key={tone}>
                              <RadioGroupItem value={tone} id={`tone-${tone}`} className="peer sr-only" />
                              <Label
                                htmlFor={`tone-${tone}`}
                                className="flex cursor-pointer items-center gap-2 rounded-md border border-border/50 bg-secondary/20 px-3 py-2 text-sm peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-500/10 hover-elevate"
                                data-testid={`radio-tone-${tone}`}
                              >
                                <config.icon className="w-4 h-4" />
                                {config.label}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-teal-400">3</span>
                        </div>
                        <Label className="text-sm font-semibold">Template</Label>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {TEMPLATES[selectedType as keyof typeof TEMPLATES]?.map((template) => (
                          <button
                            key={template.name}
                            type="button"
                            onClick={() => setSelectedTemplate(template.name)}
                            className={`p-3 rounded-lg border text-left transition-all hover-elevate ${
                              selectedTemplate === template.name 
                                ? 'bg-teal-500/10 border-teal-500/50' 
                                : 'bg-secondary/20 border-border/50'
                            }`}
                            data-testid={`button-template-${template.name.toLowerCase().replace(/\s/g, '-')}`}
                          >
                            <div className="text-sm font-medium">{template.name}</div>
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Core Message Inputs */}
                    <div className="space-y-4 p-4 bg-secondary/10 rounded-lg border border-border/30">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-teal-400">4</span>
                        </div>
                        <Label className="text-sm font-semibold">Your Message</Label>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Who is your audience?</Label>
                          <Input 
                            {...form.register("coreMessage.audience")} 
                            placeholder={EXAMPLE_PROMPTS.audience[Math.floor(Math.random() * EXAMPLE_PROMPTS.audience.length)]}
                            data-testid="input-audience" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">What pain do they feel?</Label>
                          <Input 
                            {...form.register("coreMessage.pain")} 
                            placeholder={EXAMPLE_PROMPTS.pain[Math.floor(Math.random() * EXAMPLE_PROMPTS.pain.length)]}
                            data-testid="input-pain" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">What transformation do you promise?</Label>
                          <Textarea 
                            {...form.register("coreMessage.promise")} 
                            placeholder={EXAMPLE_PROMPTS.promise[Math.floor(Math.random() * EXAMPLE_PROMPTS.promise.length)]}
                            className="h-20"
                            data-testid="textarea-promise" 
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending} data-testid="button-generate">
                      {isPending ? (
                         <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                      ) : (
                         <><Sparkles className="mr-2 h-4 w-4" /> Generate Content</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </CardWithBotanical>

            {/* Right Column - Generated Content Preview */}
            <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-border/20">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LayoutTemplate className="w-5 h-5 text-muted-foreground" />
                    Generated Content
                  </CardTitle>
                  {result && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                      data-testid="button-copy"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isPending ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-400 mb-4" />
                    <p className="text-sm text-muted-foreground">Crafting your content...</p>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="capitalize">{selectedType}</Badge>
                      <Badge variant="outline" className="capitalize">{selectedTone}</Badge>
                      {selectedTemplate && <Badge variant="outline">{selectedTemplate}</Badge>}
                    </div>
                    <div className="p-4 bg-secondary/20 rounded-lg border border-border/30">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">Configure your content and click Generate.</p>
                    <p className="text-xs mt-2 opacity-60">AI will create copy tailored to your voice.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="library" className="mt-6">
          <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <LayoutTemplate className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-lg font-semibold mb-2">Content Library Coming Soon</p>
              <p className="text-sm text-center max-w-md">
                Your generated content will be saved here for easy access and reuse.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
