/* ================================================================
   LAB - AI Playground & Sandbox
   Experimental AI interactions with personas and puzzles
   ================================================================ */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FlaskConical, 
  Send, 
  Loader2, 
  Brain, 
  Sparkles,
  Lightbulb,
  Scale,
  Puzzle,
  Zap,
  MessageCircle,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { LaneBg } from "@/lib/coreImagery";

interface Persona {
  id: string;
  name: string;
  description: string;
  icon: any;
  systemPrompt: string;
  color: string;
}

const PERSONAS: Persona[] = [
  {
    id: "socratic",
    name: "Socratic Tutor",
    description: "Guides through questions, never gives direct answers",
    icon: Lightbulb,
    systemPrompt: "You are a Socratic tutor. Never give direct answers. Instead, ask probing questions to guide the user to discover the answer themselves. Be patient and encouraging. Ask one question at a time.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
  },
  {
    id: "devils-advocate",
    name: "Devil's Advocate",
    description: "Challenges every assumption, finds weaknesses",
    icon: Scale,
    systemPrompt: "You are a devil's advocate. Your job is to challenge every assumption, find weaknesses in arguments, and stress-test ideas. Be constructively critical. Point out what could go wrong, alternative perspectives, and hidden assumptions.",
    color: "text-red-400 bg-red-500/10 border-red-500/30"
  },
  {
    id: "rubber-duck",
    name: "Rubber Duck",
    description: "Patient listener that helps you think out loud",
    icon: MessageCircle,
    systemPrompt: "You are a rubber duck debugger. Listen carefully to what the user explains. Ask clarifying questions. Summarize what you understand. Help them talk through their problem. Often the act of explaining reveals the solution.",
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
  },
  {
    id: "brainstormer",
    name: "Creative Brainstormer",
    description: "Generates wild ideas without judgment",
    icon: Sparkles,
    systemPrompt: "You are a creative brainstormer. Generate lots of ideas, including wild and unconventional ones. No judgment, no criticism. Build on ideas. Use 'Yes, and...' thinking. Aim for quantity over quality initially.",
    color: "text-violet-400 bg-violet-500/10 border-violet-500/30"
  },
  {
    id: "explainer",
    name: "ELI5 Explainer",
    description: "Explains complex topics simply",
    icon: Brain,
    systemPrompt: "You explain complex topics as if to a 5-year-old. Use simple words, analogies, and examples. Break down concepts into tiny digestible pieces. Check understanding before moving on.",
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
  },
  {
    id: "coach",
    name: "Accountability Coach",
    description: "Helps you commit to action",
    icon: Zap,
    systemPrompt: "You are an accountability coach. Help users clarify their goals, break them into specific actions, set deadlines, and commit. Be supportive but firm. Ask: What will you do? By when? How will you know it's done?",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
  }
];

const PUZZLES = [
  {
    id: "trolley",
    category: "Ethics",
    title: "The Trolley Problem",
    prompt: "A trolley is heading toward 5 people tied to the tracks. You can pull a lever to divert it to another track where 1 person is tied. What do you do and why?"
  },
  {
    id: "monty-hall",
    category: "Logic",
    title: "Monty Hall Problem",
    prompt: "You're on a game show with 3 doors. Behind one is a car, behind the others are goats. You pick door 1. The host opens door 3 (a goat). Should you switch to door 2 or stick with door 1?"
  },
  {
    id: "ship-of-theseus",
    category: "Philosophy",
    title: "Ship of Theseus",
    prompt: "If you replace every plank of a ship over time, is it still the same ship? What if you build a new ship from all the old planks?"
  },
  {
    id: "prisoner-dilemma",
    category: "Game Theory",
    title: "Prisoner's Dilemma",
    prompt: "Two prisoners can either cooperate (stay silent) or defect (betray). If both cooperate: 1 year each. If both defect: 3 years each. If one defects: defector goes free, cooperator gets 5 years. What should they do?"
  },
  {
    id: "chinese-room",
    category: "AI Philosophy",
    title: "Chinese Room",
    prompt: "A person in a room follows rules to respond to Chinese messages, producing perfect Chinese responses without understanding Chinese. Does the room understand Chinese? Does this relate to AI understanding?"
  },
  {
    id: "survival-scenario",
    category: "Critical Thinking",
    title: "Desert Island Survival",
    prompt: "Your plane crashes on a desert island. You can only grab 3 items from the wreckage: flare gun, water purifier, fishing net, knife, radio (broken), tarp, first aid kit, matches. Which 3 and why?"
  }
];

const PROMPT_TEMPLATES = [
  { id: "steelman", label: "Steelman this argument", prompt: "Give the strongest possible version of this argument: " },
  { id: "weakman", label: "Find the weaknesses", prompt: "What are the weakest points in this reasoning: " },
  { id: "simplify", label: "Simplify this", prompt: "Explain this in the simplest possible terms: " },
  { id: "expand", label: "Expand on this", prompt: "Give me 5 different ways to think about: " },
  { id: "contrarian", label: "Contrarian view", prompt: "What's the contrarian take on: " },
  { id: "firstprinciples", label: "First principles", prompt: "Break this down to first principles: " }
];

export default function Lab() {
  const [activeTab, setActiveTab] = useState("personas");
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [copied, setCopied] = useState(false);

  const { mutate: sendPrompt, isPending } = useMutation({
    mutationFn: async ({ prompt, systemPrompt }: { prompt: string; systemPrompt: string }) => {
      const res = await apiRequest("POST", "/api/lab/prompt", { prompt, systemPrompt });
      return res.json();
    },
    onSuccess: (data) => {
      setResponse(data.response);
    }
  });

  const handleSend = () => {
    if (!input.trim() || !selectedPersona) return;
    sendPrompt({ prompt: input, systemPrompt: selectedPersona.systemPrompt });
  };

  const handlePuzzle = (puzzle: typeof PUZZLES[0]) => {
    setSelectedPersona(PERSONAS[0]);
    setInput(puzzle.prompt);
    setActiveTab("personas");
  };

  const handleTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setInput(template.prompt);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-full">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ 
          backgroundImage: `url(${LaneBg.trunk2})`,
          backgroundPosition: "center 30%"
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ 
              backgroundImage: `url(${LaneBg.trunk})`,
              backgroundPosition: "center 40%"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        
          <div className="relative z-10 p-6 md:p-8">
            <div className="bg-black/70 border border-violet-500/40 p-4 md:p-5 backdrop-blur-md inline-block">
              <p className="font-mono text-violet-400/80 text-xs mb-1 tracking-wider">lab@experimental:~$</p>
              <h2 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-violet-300 uppercase flex items-center gap-3">
                <FlaskConical className="w-7 h-7" />
                AI_LAB<span className="cursor-blink">_</span>
              </h2>
              <p className="font-mono text-violet-400/70 text-xs mt-2 tracking-wide">
                &gt; experimental playground // personas &amp; puzzles
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
            <TabsTrigger value="personas" data-testid="tab-personas">
              <Brain className="w-4 h-4 mr-2" /> Personas
            </TabsTrigger>
            <TabsTrigger value="puzzles" data-testid="tab-puzzles">
              <Puzzle className="w-4 h-4 mr-2" /> Puzzles
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <Sparkles className="w-4 h-4 mr-2" /> Templates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personas" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <Card className="border-border/30 bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-lg">Select Persona</CardTitle>
                    <CardDescription>Choose an AI personality</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {PERSONAS.map((persona) => {
                      const Icon = persona.icon;
                      const isSelected = selectedPersona?.id === persona.id;
                      return (
                        <div
                          key={persona.id}
                          onClick={() => setSelectedPersona(persona)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? `${persona.color} border-current` 
                              : "border-border/30 hover:border-border/60"
                          }`}
                          data-testid={`persona-${persona.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isSelected ? "" : "text-muted-foreground"}`} />
                            <div>
                              <div className="font-medium text-sm">{persona.name}</div>
                              <div className="text-xs text-muted-foreground">{persona.description}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="border-border/30 bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {selectedPersona ? (
                        <>
                          <selectedPersona.icon className="w-5 h-5" />
                          {selectedPersona.name}
                        </>
                      ) : (
                        "Select a Persona"
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={selectedPersona ? "Enter your prompt..." : "Select a persona first..."}
                      disabled={!selectedPersona}
                      className="min-h-[100px] resize-none"
                      data-testid="input-prompt"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => { setInput(""); setResponse(""); }}
                        disabled={!input && !response}
                        data-testid="button-clear"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> Clear
                      </Button>
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || !selectedPersona || isPending}
                        data-testid="button-send"
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send
                      </Button>
                    </div>

                    {response && (
                      <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-mono">RESPONSE</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyResponse}
                            data-testid="button-copy"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="text-response">
                          {response}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="puzzles" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PUZZLES.map((puzzle) => (
                <Card 
                  key={puzzle.id} 
                  className="border-border/30 bg-card/80 hover:border-violet-500/30 transition-colors cursor-pointer"
                  onClick={() => handlePuzzle(puzzle)}
                  data-testid={`puzzle-${puzzle.id}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {puzzle.category}
                      </Badge>
                      <Puzzle className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">{puzzle.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {puzzle.prompt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="mt-6">
            <Card className="border-border/30 bg-card/80">
              <CardHeader>
                <CardTitle>Prompt Templates</CardTitle>
                <CardDescription>Quick-start prompts for common thinking patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PROMPT_TEMPLATES.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="h-auto py-3 justify-start"
                      onClick={() => handleTemplate(template)}
                      data-testid={`template-${template.id}`}
                    >
                      <Sparkles className="w-4 h-4 mr-2 shrink-0" />
                      <span className="text-left">{template.label}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Your prompt will appear here after selecting a template..."
                    className="min-h-[100px] resize-none"
                    data-testid="input-template-prompt"
                  />
                  <div className="flex justify-end mt-3">
                    <Button
                      onClick={() => {
                        if (!selectedPersona) setSelectedPersona(PERSONAS[0]);
                        setActiveTab("personas");
                      }}
                      disabled={!input.trim()}
                      data-testid="button-use-template"
                    >
                      <Send className="w-4 h-4 mr-2" /> Use with Persona
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
