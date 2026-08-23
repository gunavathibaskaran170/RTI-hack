import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "var(--bg-parchment)",
          subtle: "var(--bg-parchment-subtle)",
          card: "var(--bg-parchment-card)",
        },
        saffron: {
          DEFAULT: "#C9622A",
          hover: "#B05220",
          light: "var(--color-saffron-light)",
        },
        forest: {
          DEFAULT: "#1F6F4A",
          hover: "#18583A",
          light: "var(--color-forest-light)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
          light: "var(--color-ink-light)",
        },
        crimson: {
          DEFAULT: "#A82216",
          light: "#FDF2F1",
        },
        border: {
          subtle: "var(--border-subtle)",
          card: "var(--border-card)",
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Lora", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
