import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // The editor's "Insert WhatsApp Button" writes these utilities into HTML that
  // lives in the database, so Tailwind can't see them when scanning source.
  safelist: [
    'inline-flex',
    'items-center',
    'gap-2',
    'bg-emerald-500',
    'hover:bg-emerald-600',
    'text-white',
    'font-semibold',
    'px-6',
    'py-3',
    'rounded-lg',
    'my-4',
    'no-underline',
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
        // Ambient background art. `alternate` on the animation gives the to-and-fro
        // without needing a return keyframe.
        drift: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(0, -24px, 0)" },
        },
        "drift-tilt": {
          from: { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          to: { transform: "translate3d(16px, -18px, 0) rotate(4deg)" },
        },
        // Motion *inside* the illustrations. Dashes crawling along a path read as
        // travel; the offset below is one loop of the pattern, so every dashed
        // path using it needs a strokeDasharray whose cycle divides 32 evenly
        // ("16 16", "4 12", "2 6") — anything else visibly jumps on repeat.
        "dash-flow": {
          to: { strokeDashoffset: "-32" },
        },
        // Signal rings leaving a hub. Each ring carries its own animationDelay so
        // one keyframe set produces a staggered sequence.
        ripple: {
          "0%": { transform: "scale(0.3)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        // City lights, pass dots, beacons: a slow breath, never a hard blink.
        "pulse-soft": {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.85" },
        },
        "sway-x": {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-28px, 0, 0)" },
        },
        // Wheels and dial hands. Declared here rather than reusing the core
        // `spin` keyframe so the rule is emitted from this file's own theme.
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        drift: "drift 9s ease-in-out infinite alternate",
        "drift-tilt": "drift-tilt 13s ease-in-out infinite alternate",
        "dash-flow": "dash-flow 2.4s linear infinite",
        ripple: "ripple 4s ease-out infinite",
        "pulse-soft": "pulse-soft 3.2s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        "sway-x": "sway-x 11s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
