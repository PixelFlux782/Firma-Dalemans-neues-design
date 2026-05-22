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
          sand: "#C4A574",
          gold: "#A68B5B",
          charcoal: "#2C2825",
          ink: "#1A1816",
          muted: "#6B6560",
          subtle: "#9A948C",
        },
      },
      fontFamily: {
        sans: [
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
          "0 1px 2px rgba(26, 24, 22, 0.04), 0 8px 32px rgba(26, 24, 22, 0.06)",
        "premium-lg":
          "0 4px 6px rgba(26, 24, 22, 0.04), 0 24px 48px rgba(26, 24, 22, 0.08)",
        "premium-glow":
          "0 0 0 1px rgba(255, 255, 255, 0.08), 0 20px 40px rgba(26, 24, 22, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      spacing: {
        section: "6rem",
        "section-lg": "8rem",
      },
      transitionDuration: {
        premium: "500ms",
      },
    },
  },
  plugins: [],
};
