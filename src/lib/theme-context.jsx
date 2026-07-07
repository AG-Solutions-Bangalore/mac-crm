import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState(localStorage.getItem("theme-color") || "default");
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme-mode") || "light"); // "light" | "dark" | "system"

  useEffect(() => {
    const root = document.documentElement;

    // Remove existing color classes
    root.classList.remove(
      "theme-yellow",
      "theme-green",
      "theme-purple",
      "theme-teal",
      "theme-gray"
    );

    // Apply color class
    if (themeColor !== "default") {
      root.classList.add(`theme-${themeColor}`);
    }

    localStorage.setItem("theme-color", themeColor);
  }, [themeColor]);

  useEffect(() => {
    const root = document.documentElement;

    const applyMode = (mode) => {
      if (mode === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else if (mode === "light") {
        root.classList.add("light");
        root.classList.remove("dark");
      } else {
        // System preference
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemPrefersDark) {
          root.classList.add("dark");
          root.classList.remove("light");
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
        }
      }
    };

    applyMode(themeMode);
    localStorage.setItem("theme-mode", themeMode);

    // If system preference, listen for changes
    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        applyMode("system");
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme: themeColor,
        setTheme: setThemeColor,
        themeMode,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
