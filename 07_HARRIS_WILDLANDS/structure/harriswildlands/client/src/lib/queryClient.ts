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

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
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

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    if (isDemoMode()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return getDemoData(url) as any;
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
