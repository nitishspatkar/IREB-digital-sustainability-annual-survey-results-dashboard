import { useCallback, useEffect, useState } from "react";

/**
 * Returns the current value of a CSS variable (custom property) from the :root element.
 * Example: useThemeColor("--color-plum-400").
 * It listens to color scheme changes and window resize to react to theme toggles.
 */
export default function useThemeColor(varName: string) {
  const readVar = useCallback(() => {
    if (typeof window === "undefined") return "";
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(varName).trim();
    return value || "";
  }, [varName]);

  const [color, setColor] = useState<string>(readVar);

  useEffect(() => {
    setColor(readVar());

    // Update on theme toggles (prefers-color-scheme) and resize which can
    // affect responsive CSS that may override variables.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setColor(readVar());

    // Some apps dispatch a custom event on theme change; support it if present.
    window.addEventListener("themechange", onChange as EventListener);
    media.addEventListener?.("change", onChange);
    window.addEventListener("resize", onChange);

    return () => {
      window.removeEventListener("themechange", onChange as EventListener);
      media.removeEventListener?.("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [readVar]);

  return color;
}
