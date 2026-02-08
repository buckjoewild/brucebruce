/* ================================================================
   THEME PROVIDER - FIELD / LAB / SANCTUARY mode switching
   Manages theme state and provides context to the app
   ================================================================ */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "field" | "lab" | "sanctuary";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  overlayEnabled: boolean;
  setOverlayEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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

  useEffect(() => {
    localStorage.setItem("wildlands-overlay", String(overlayEnabled));
  }, [overlayEnabled]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setOverlayEnabled = (enabled: boolean) => {
    setOverlayEnabledState(enabled);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, overlayEnabled, setOverlayEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
