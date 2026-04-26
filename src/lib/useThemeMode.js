import { useEffect, useState } from "react";

export function useThemeMode({ activityLevel = 0, intent = null } = {}) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const hour = new Date().getHours();
    const dayMode = hour >= 7 && hour < 18;

    let next = dayMode ? "light" : "dark";

    const darkIntents = ["nightlife", "bars", "music", "events", "rooftop"];
    const lightIntents = ["coffee", "lunch", "wellness", "fitness", "civic", "services"];

    if (intent && darkIntents.includes(String(intent).toLowerCase())) {
      next = "dark";
    }

    if (intent && lightIntents.includes(String(intent).toLowerCase())) {
      next = "light";
    }

    if (activityLevel > 200) {
      next = "dark";
    }

    setTheme(next);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    document.documentElement.dataset.dpTheme = next;
  }, [activityLevel, intent]);

  return theme;
}
