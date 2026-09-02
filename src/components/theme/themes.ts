export type ThemeKey = "night" | "warm" | "cool" | "day" | "light";
export const THEMES: { key: ThemeKey; label: string; feel: string; swatch: string[] }[] = [
  { key: "night", label: "Dark", feel: "A midnight screening", swatch: ["#0a0a0c", "#17171b", "#d6a24d", "#3d9a99"] },
  { key: "warm", label: "Warm", feel: "An old cinema archive", swatch: ["#17100d", "#291d19", "#cf9b45", "#8f3a3a"] },
  { key: "cool", label: "Cool", feel: "A modern independent film", swatch: ["#0c1117", "#16212d", "#79b8cf", "#3f6fa6"] },
  { key: "day", label: "Day", feel: "A photographed film journal", swatch: ["#f3efe7", "#faf8f3", "#b5702a", "#1a1815"] },
  { key: "light", label: "Light", feel: "A printed cinema publication", swatch: ["#ffffff", "#f6f4ef", "#8a2c2c", "#0b0b0b"] },
];
