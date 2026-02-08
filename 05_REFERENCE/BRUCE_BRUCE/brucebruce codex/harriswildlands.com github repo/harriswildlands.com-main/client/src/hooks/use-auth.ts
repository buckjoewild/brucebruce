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

  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function logout(): Promise<void> {
  if (isDemoMode()) {
    localStorage.removeItem("demo-mode");
    window.location.href = "/";
    return;
  }
  window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
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

export { isDemoMode };
