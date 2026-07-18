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
        background: "#030712",
        surface: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
        },
        primary: {
          DEFAULT: "#10B981",
          hover: "#059669",
        },
        accent: {
          DEFAULT: "#F59E0B",
        },
        text: {
          primary: "#F9FAFB",
          secondary: "#9CA3AF",
          tertiary: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-emerald": "0 0 40px -10px rgba(16, 185, 129, 0.15)",
      },
      keyframes: {
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(0.5rem)" },
        },
      },
      animation: {
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
