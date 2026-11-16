"use client";

import { useEffect, useRef, useState } from "react";

export function useThemeMode() {
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCrashing, setIsCrashing] = useState(false);
  const themeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setLight(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    setLight((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("light", next);
      localStorage.setItem("theme", next ? "light" : "dark");
      return next;
    });
  };

  const handleThemeClick = () => {
    if (isCrashing) return;
    setIsCrashing(true);
  };

  const handleImpact = () => {
    toggleTheme();
  };

  const handleCrashComplete = () => {
    setIsCrashing(false);
  };

  return {
    light,
    mounted,
    isCrashing,
    themeBtnRef,
    handleThemeClick,
    handleImpact,
    handleCrashComplete,
    toggleTheme,
  };
}
