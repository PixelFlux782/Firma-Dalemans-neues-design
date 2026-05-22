/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          canvas: "#F7F5F2",
          warm: "#EDE8E1",
          beige: "#D9D0C4",
          stone: "#B8A99A",
          sand: "#C4A574",
          bronze: "#9A7B55",
          gold: "#A68B5B",
          charcoal: "#2C2825",
          ink: "#1A1816",
          espresso: "#141210",
          muted: "#6B6560",
          subtle: "#9A948C",
          highlight: "#F5F0E8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        premium:
          "0 1px 2px rgba(20, 18, 16, 0.04), 0 12px 40px rgba(20, 18, 16, 0.06)",
        "premium-lg":
          "0 8px 24px rgba(20, 18, 16, 0.06), 0 32px 64px rgba(20, 18, 16, 0.1)",
        "premium-xl":
          "0 16px 48px rgba(20, 18, 16, 0.08), 0 48px 96px rgba(20, 18, 16, 0.12)",
        "premium-glow":
          "0 0 0 1px rgba(255, 255, 255, 0.06), 0 24px 48px rgba(20, 18, 16, 0.14)",
        "inner-soft": "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      spacing: {
        section: "7rem",
        "section-lg": "9rem",
      },
      transitionDuration: {
        premium: "600ms",
        cinematic: "900ms",
      },
      animation: {
        "fade-up": "fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "ambient-drift": "ambient-drift 28s ease-in-out infinite",
        "light-float": "light-float 18s ease-in-out infinite",
        "reveal-soft": "reveal-soft 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "ambient-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(2%, -1.5%) scale(1.03)" },
        },
        "light-float": {
          "0%, 100%": { opacity: "0.45", transform: "translate(0, 0)" },
          "50%": { opacity: "0.7", transform: "translate(-3%, 2%)" },
        },
        "reveal-soft": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
