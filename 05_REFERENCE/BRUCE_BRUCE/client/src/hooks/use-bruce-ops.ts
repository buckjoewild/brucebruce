import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertLog, InsertIdea, InsertTeachingRequest, InsertHarrisContent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isDemoMode } from "@/hooks/use-auth";
import { demoLogs, demoIdeas, demoContent } from "@/hooks/use-demo";

// ==========================================
// DASHBOARD
// ==========================================
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

// ==========================================
// LIFEOPS (Logs)
// ==========================================
export function useLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      if (isDemoMode()) {
        return demoLogs as any;
      }
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
    onError: (err) => {
      toast({ title: "Error", description: err.message || "Failed to save log", variant: "destructive" });
    }
  });
}

export function useUpdateLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, date, ...logData }: InsertLog & { id: number }) => {
      if (isDemoMode()) {
        return { id, date, ...logData, createdAt: new Date().toISOString() } as any;
      }
      const payload: InsertLog = { date, ...logData };
      const res = await fetch(`/api/logs/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update log");
      return await res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs", variables.date] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.get.path] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message || "Failed to update log", variant: "destructive" });
    }
  });
}

// ==========================================
// THINKOPS (Ideas)
// ==========================================
export function useIdeas() {
  return useQuery({
    queryKey: [api.ideas.list.path],
    queryFn: async () => {
      if (isDemoMode()) {
        return demoIdeas as any;
      }
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
      toast({ title: isDemoMode() ? "Demo: Idea Captured" : "Idea Captured", description: "Added to your ThinkOps inbox." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & any) => {
      const url = buildUrl(api.ideas.update.path, { id });
      const res = await fetch(url, {
        method: api.ideas.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update idea");
      return api.ideas.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ideas.list.path] });
      toast({ title: "Idea Updated", description: "Changes saved successfully." });
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

// ==========================================
// TEACHING ASSISTANT
// ==========================================
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
      toast({ title: "Lesson Plan Generated", description: "Bruce has created your materials." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

// ==========================================
// HARRIS WILDLANDS
// ==========================================
export function useCreateHarrisContent() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertHarrisContent) => {
      const res = await fetch(api.harris.create.path, {
        method: api.harris.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate content");
      return api.harris.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Content Generated", description: "Site copy is ready for review." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

// ==========================================
// TRANSCRIPTS (BRAINDUMPS)
// ==========================================
export function useTranscripts() {
  return useQuery({
    queryKey: ["/api/transcripts"],
    queryFn: async () => {
      if (isDemoMode()) {
        return [];
      }
      const res = await fetch("/api/transcripts");
      if (!res.ok) throw new Error("Failed to fetch transcripts");
      return await res.json();
    },
  });
}

export function useTranscriptStats() {
  return useQuery({
    queryKey: ["/api/transcripts/stats"],
    queryFn: async () => {
      if (isDemoMode()) {
        return { total: 0, analyzed: 0, totalWords: 0, topThemes: [] };
      }
      const res = await fetch("/api/transcripts/stats");
      if (!res.ok) throw new Error("Failed to fetch transcript stats");
      return await res.json();
    },
  });
}

export function useCreateTranscript() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { title: string; content: string; fileName?: string; sessionDate?: string; participants?: string }) => {
      if (isDemoMode()) {
        return { id: Date.now(), ...data, wordCount: data.content.split(/\s+/).length, analyzed: false };
      }
      const res = await fetch("/api/transcripts", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create transcript");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transcripts/stats"] });
      toast({ title: "Transcript Added", description: "Your braindump has been saved." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useAnalyzeTranscript() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      if (isDemoMode()) {
        return { id, analyzed: true, patterns: {}, topThemes: [], scorecard: {} };
      }
      const res = await fetch(`/api/transcripts/${id}/analyze`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze transcript");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transcripts/stats"] });
      toast({ title: "Analysis Complete", description: "Patterns have been extracted from your braindump." });
    },
    onError: (err) => {
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
    }
  });
}

export function useDeleteTranscript() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      if (isDemoMode()) {
        return { success: true };
      }
      const res = await fetch(`/api/transcripts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete transcript");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transcripts/stats"] });
      toast({ title: "Transcript Deleted" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}
