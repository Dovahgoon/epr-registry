// src/lib/theme.ts
export type Theme = "light" | "dark";

function prefersDark(): boolean {
  try {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch { return false; }
}

export function initTheme(): Theme {
  try {
    const saved = (localStorage.getItem("theme") as Theme | null);
    const next: Theme = saved || (prefersDark() ? "dark" : "light");
    if (typeof document !== "undefined") {
      if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
      else document.documentElement.removeAttribute("data-theme");
    }
    return next;
  } catch { return "light"; }
}

export function setTheme(next: Theme): Theme {
  try {
    if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", next);
    return next;
  } catch { return next; }
}
