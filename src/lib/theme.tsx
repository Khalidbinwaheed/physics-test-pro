import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "physics_exam_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage or system preference
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      } else {
        // Default to dark as requested for Physics Portal, or system
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeState(prefersDark ? "dark" : "light");
      }
    } catch {
      // fallback
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let active: "light" | "dark" = "dark";
      if (theme === "system") {
        active = mediaQuery.matches ? "dark" : "light";
      } else {
        active = theme;
      }

      setResolvedTheme(active);

      const root = document.documentElement;
      if (active === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
        root.style.colorScheme = "light";
      }
    };

    applyTheme();

    const listener = () => {
      if (theme === "system") applyTheme();
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore storage error
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
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

/**
 * Tactile Neumorphic Theme Toggle Component
 */
export function ThemeToggle({
  className = "",
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle light and dark theme"
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs transition-all duration-200 cursor-pointer neu-btn-interactive ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {resolvedTheme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>

      {showLabel ? (
        <span className="font-semibold text-foreground text-xs select-none">
          {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      ) : (
        <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground hidden sm:inline select-none">
          {resolvedTheme === "dark" ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}

/**
 * 3-Way Segmented Neumorphic Switcher (Light / System / Dark)
 */
export function ThemeSegmentedControl({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options: { id: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "system", label: "Auto", icon: Laptop },
    { id: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl neu-inset bg-background ${className}`}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              isActive
                ? "neu-raised text-primary font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
