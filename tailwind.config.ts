import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8eb6ff",
          400: "#598cff",
          500: "#3563ff",
          600: "#1f43f5",
          700: "#1732e1",
          800: "#192bb6",
          900: "#1a2b8f",
          950: "#141a57",
        },
        sidebar: {
          DEFAULT: "#0b1120",
          hover: "#17233d",
          active: "#2563eb",
          muted: "#94a3b8",
        },
        operator: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        }
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)",
        elevated:
          "0 10px 30px -12px rgba(15,23,42,0.18), 0 4px 8px -4px rgba(15,23,42,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
