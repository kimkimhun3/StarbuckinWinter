import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F5F1E8",
          dim: "#EDE7D9",
        },
        ink: {
          DEFAULT: "#1C1C1A",
          soft: "#3D3D3D",
          muted: "#5D5D5D",
          faint: "#9D9D9D",
        },
        midnight: {
          DEFAULT: "#0E0F10",
          surface: "#16171A",
          line: "#2A2B2E",
        },
        ember: "#C0512F",
        moss: "#5C6B4F",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        jp: ["var(--font-jp)", "'Yu Mincho'", "YuMincho", "serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      animation: {
        "fade-up": "fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards",
        "line-grow": "lineGrow 1s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        lineGrow: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
