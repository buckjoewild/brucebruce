# Priority 2: Frontend Reference

**Generated:** December 27, 2025  
**Project:** BruceOps / HarrisWildlands

---

## Table of Contents
1. [Layout & Navigation](#layout--navigation)
2. [Theme Provider](#theme-provider)
3. [API Hooks](#api-hooks)
4. [Query Client](#query-client)
5. [Auth Hook](#auth-hook)
6. [Key Pages](#key-pages)
7. [UI Component Patterns](#ui-component-patterns)

---

## Layout & Navigation

**File:** `client/src/components/Layout.tsx`

The main layout implements a botanical sci-fi "Holo-Atlas" aesthetic with:
- Responsive sidebar navigation (desktop: fixed, mobile: overlay)
- Three theme modes: Field (green), Lab (teal), Sanctuary (amber)
- Interface overlay toggle
- Authentication state management

### Navigation Items

```typescript
const navItems = [
  { href: "/", label: "Core", sublabel: "BruceOps", icon: Eye },
  { href: "/life-ops", label: "Roots", sublabel: "LifeOps", icon: Sprout },
  { href: "/goals", label: "Growth", sublabel: "Goals", icon: Target },
  { href: "/think-ops", label: "Canopy", sublabel: "ThinkOps", icon: CloudSun },
  { href: "/reality-check", label: "Reality", sublabel: "Check Ideas", icon: BrainCircuit },
  { href: "/weekly-review", label: "Review", sublabel: "Weekly", icon: BarChart3 },
  { href: "/chat", label: "Steward", sublabel: "AI Chat", icon: MessageSquare },
  { href: "/teaching", label: "Lab", sublabel: "Teaching", icon: Microscope },
  { href: "/harris", label: "Wildlands", sublabel: "Brand", icon: Trees },
];
```

### Key Components

```typescript
// Navigation link with active state
const NavLink = ({ href, icon: Icon, label, sublabel }) => {
  const isActive = location === href;
  return (
    <Link href={href}>
      <div className={cn(
        "holo-nav-item flex items-center gap-3 px-4 py-2.5 rounded-md transition-all",
        isActive && "active bg-emerald-500/15 border border-emerald-500/40"
      )}>
        <Icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-muted-foreground")} />
        <div className="flex flex-col">
          <span className={cn("text-sm", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
            {label}
          </span>
          {sublabel && <span className="text-[10px] text-muted-foreground/70">{sublabel}</span>}
        </div>
      </div>
    </Link>
  );
};
```

### Unauthenticated State

When not logged in, displays a full-screen portal entry with:
- Background image with dark gradient wash
- MS-DOS style terminal branding
- "ENTER_THE_WILDLANDS" login button
- Energy line animations

---

## Theme Provider

**File:** `client/src/components/ThemeProvider.tsx`

```typescript
export type ThemeMode = "field" | "lab" | "sanctuary";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  overlayEnabled: boolean;
  setOverlayEnabled: (enabled: boolean) => void;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("wildlands-theme") as ThemeMode) || "lab";
    }
    return "lab";
  });

  const [overlayEnabled, setOverlayEnabledState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wildlands-overlay") === "true";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("wildlands-theme", theme);
  }, [theme]);

  // ...
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
```

---

## API Hooks

**File:** `client/src/hooks/use-bruce-ops.ts`

All data hooks for the four operational lanes.

### Dashboard

```typescript
export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.get.path],
    queryFn: async () => {
      if (isDemoMode()) {
        return { logsToday: 1, openLoops: 2, driftFlags: 0, aiCalls: 5 };
      }
      const res = await fetch(api.dashboard.get.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.get.responses[200].parse(await res.json());
    },
  });
}
```

### LifeOps (Logs)

```typescript
export function useLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      if (isDemoMode()) return demoLogs as any;
      const res = await fetch(api.logs.list.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
  });
}

export function useLogByDate(date: string) {
  return useQuery({
    queryKey: ["/api/logs", date],
    queryFn: async () => {
      if (isDemoMode()) {
        const log = demoLogs.find((l: any) => l.date === date);
        return log || null;
      }
      const res = await fetch(`/api/logs/${date}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch log");
      return await res.json();
    },
    enabled: !!date,
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertLog) => {
      if (isDemoMode()) {
        return { id: Date.now(), ...data, createdAt: new Date().toISOString() } as any;
      }
      const res = await fetch(api.logs.create.path, {
        method: api.logs.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create log");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs", variables.date] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
    },
  });
}
```

### ThinkOps (Ideas)

```typescript
export function useIdeas() {
  return useQuery({
    queryKey: [api.ideas.list.path],
    queryFn: async () => {
      if (isDemoMode()) return demoIdeas as any;
      const res = await fetch(api.ideas.list.path);
      if (!res.ok) throw new Error("Failed to fetch ideas");
      return api.ideas.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertIdea) => {
      if (isDemoMode()) {
        return { id: Date.now(), ...data, createdAt: new Date().toISOString() } as any;
      }
      const res = await fetch(api.ideas.create.path, {
        method: api.ideas.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to capture idea");
      return api.ideas.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ideas.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
      toast({ title: "Idea Captured", description: "Added to your ThinkOps inbox." });
    },
  });
}

export function useRealityCheck() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.ideas.runRealityCheck.path, { id });
      const res = await fetch(url, { method: api.ideas.runRealityCheck.method });
      if (!res.ok) throw new Error("Reality check failed");
      return api.ideas.runRealityCheck.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ideas.list.path] });
      toast({ title: "Reality Check Complete", description: "AI analysis ready for review." });
    },
  });
}
```

### Teaching Assistant

```typescript
export function useTeachingRequests() {
  return useQuery({
    queryKey: [api.teaching.list.path],
    queryFn: async () => {
      const res = await fetch(api.teaching.list.path);
      if (!res.ok) throw new Error("Failed to fetch teaching requests");
      return api.teaching.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTeachingRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTeachingRequest) => {
      const res = await fetch(api.teaching.create.path, {
        method: api.teaching.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate lesson plan");
      return api.teaching.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teaching.list.path] });
      toast({ title: "Lesson Plan Generated" });
    },
  });
}
```

---

## Query Client

**File:** `client/src/lib/queryClient.ts`

```typescript
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { demoLogs, demoIdeas, demoContent } from "@/hooks/use-demo";

function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("demo") === "true" || localStorage.getItem("demo-mode") === "true";
}

function getDemoData(url: string): unknown {
  if (url.includes("/api/logs")) return demoLogs;
  if (url.includes("/api/ideas")) return demoIdeas;
  if (url.includes("/api/harris-content")) return demoContent;
  if (url.includes("/api/lessons")) return [];
  if (url.includes("/api/dashboard")) return { logsToday: 1, openLoops: 2, driftFlags: 0, aiCalls: 5 };
  return [];
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  if (isDemoMode()) {
    return new Response(JSON.stringify({ success: true, demo: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});
```

---

## Auth Hook

**File:** `client/src/hooks/use-auth.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("demo") === "true" || localStorage.getItem("demo-mode") === "true";
}

const demoUser: User = {
  id: "demo-user",
  email: "demo@harriswildlands.com",
  firstName: "Demo",
  lastName: "Visitor",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function fetchUser(): Promise<User | null> {
  if (isDemoMode()) {
    localStorage.setItem("demo-mode", "true");
    return demoUser;
  }

  const response = await fetch("/api/auth/user", { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (isDemoMode()) {
        localStorage.removeItem("demo-mode");
        window.location.href = "/";
        return;
      }
      window.location.href = "/api/logout";
    },
    onSuccess: () => queryClient.setQueryData(["/api/auth/user"], null),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    isDemo: isDemoMode(),
  };
}
```

---

## Key Pages

### Reality Check Page

**File:** `client/src/pages/RealityCheck.tsx`

Features:
- Real-time idea validation using AI
- Known/Likely/Speculation classification
- Self-deception pattern detection
- Decision bins: Discard/Park/Salvage/Promote

```typescript
export default function RealityCheck() {
  const { data: ideas, isLoading } = useIdeas();
  const realityCheckMutation = useRealityCheck();
  
  // Filters ideas needing reality check
  const needsCheck = ideas?.filter(i => i.status === "draft" && !i.realityCheck);
  const checked = ideas?.filter(i => i.realityCheck);
  
  // UI with glass-morphism cards showing:
  // - Idea title and pitch
  // - "Run Reality Check" button
  // - Results: Known[], Likely[], Speculation[]
  // - Flags[] for self-deception patterns
  // - Decision recommendation
}
```

### Weekly Review Page

**File:** `client/src/pages/WeeklyReview.tsx`

Features:
- Completion rate statistics
- Interactive donut chart (Recharts)
- Domain breakdown visualization
- AI-generated weekly insight (cached daily)
- Export capability

```typescript
export default function WeeklyReview() {
  const { data: review, isLoading } = useQuery({
    queryKey: [api.weeklyReview.get.path],
    queryFn: async () => {
      const res = await fetch(api.weeklyReview.get.path);
      return res.json();
    }
  });
  
  const insightMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/review/weekly/insight", { method: "POST" });
      return res.json();
    }
  });
  
  // Renders:
  // - Stats cards (completion %, check-ins, goals)
  // - Donut chart for completion visualization
  // - Domain breakdown with progress bars
  // - AI insight section with generate button
  // - Drift flags list
}
```

### Chat Page (Bruce Steward)

**File:** `client/src/pages/Chat.tsx`

Features:
- Conversational AI interface
- Context-aware responses (can load user data)
- Message history (session-based)
- Quick action suggestions

```typescript
export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Optional: Load context based on query type
    let context = "";
    if (input.toLowerCase().includes("goal") || input.toLowerCase().includes("week")) {
      const reviewRes = await fetch(api.weeklyReview.get.path);
      const review = await reviewRes.json();
      context = JSON.stringify(review.stats);
    }
    
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMessage], context })
    });
    
    const data = await res.json();
    setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
  };
}
```

---

## UI Component Patterns

### Glass Morphism Cards

```typescript
<Card className="bg-card/60 backdrop-blur-sm border border-emerald-500/20">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-emerald-400" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Page Headers

```typescript
<div className="mb-6 md:mb-8">
  <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
    <Icon className="w-8 h-8 text-primary" />
    Page Title
  </h1>
  <p className="text-muted-foreground mt-2">
    Page description
  </p>
</div>
```

### Loading States

```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
```

### Status Badges

```typescript
const statusColors = {
  draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  promoted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  parked: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  discarded: "bg-red-500/20 text-red-400 border-red-500/30",
};

<Badge className={cn("uppercase text-xs", statusColors[status])}>
  {status}
</Badge>
```

### Data Test IDs

All interactive elements include `data-testid` attributes:

```typescript
<Button 
  data-testid="button-submit-log"
  onClick={handleSubmit}
>
  Save Log
</Button>

<Input 
  data-testid="input-idea-title"
  value={title}
  onChange={...}
/>
```
