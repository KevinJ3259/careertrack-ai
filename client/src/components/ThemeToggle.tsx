import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "careertrack_theme";

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${
        theme === "light" ? "dark" : "light"
      } mode`}
      title={`Switch to ${
        theme === "light" ? "dark" : "light"
      } mode`}
    >
      <span aria-hidden="true">
        {theme === "light" ? "🌙" : "☀️"}
      </span>

      <span>
        {theme === "light" ? "Dark mode" : "Light mode"}
      </span>
    </button>
  );
}