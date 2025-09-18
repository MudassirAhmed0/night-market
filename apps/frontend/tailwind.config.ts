import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        // driven by CSS variables defined in globals.css
        bg: "var(--bg)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        border: "var(--border)",
        primary: "var(--primary)",
        primaryFg: "var(--primary-fg)",
        card: "var(--card)",
        cardFg: "var(--card-fg)",
        ring: "var(--ring)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;
