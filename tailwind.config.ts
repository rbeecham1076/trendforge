import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Direct color tokens (needed for Tailwind utilities like bg-coral-500/10)
        coral: {
          300: "rgb(252, 129, 129)",
          400: "rgb(248, 113, 113)",
          500: "#f43f5e",
          600: "#e11d48",
        },
        fuchsia: {
          300: "rgb(240, 171, 252)",
          400: "rgb(232, 121, 249)",
          500: "#d946ef",
          600: "#c026d3",
        },
        teal: {
          300: "rgb(94, 234, 212)",
          400: "rgb(45, 212, 191)",
          500: "#14b8a6",
          600: "#0d9488",
        },
        // Accent object for reference
        accent: {
          indigo: "#6366f1",
          violet: "#8b5cf6",
          fuchsia: "#d946ef",
          coral: "#f43f5e",
          amber: "#f59e0b",
          teal: "#14b8a6",
          cyan: "#06b6d4",
          emerald: "#10b981",
          pink: "#ec4899",
        },
      },
      backgroundImage: {
        "gradient-sunset":
          "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #8b5cf6 100%)",
        "gradient-ocean":
          "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #6366f1 100%)",
        "gradient-forest":
          "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
        "gradient-premium":
          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 33%, #d946ef 66%, #f43f5e 100%)",
        "gradient-mesh":
          "radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(217, 70, 239, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(244, 63, 94, 0.06) 0%, transparent 50%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        gradient: "gradient 3s ease infinite",
        "mesh-pulse": "meshPulse 8s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "color-shift": "colorShift 6s ease infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        meshPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": {
            boxShadow:
              "0 0 40px rgba(139, 92, 246, 0.15), 0 0 80px rgba(217, 70, 239, 0.1)",
          },
          "50%": {
            boxShadow:
              "0 0 60px rgba(139, 92, 246, 0.25), 0 0 120px rgba(217, 70, 239, 0.18)",
          },
        },
        colorShift: {
          "0%, 100%": { filter: "hue-rotate(0deg)" },
          "33%": { filter: "hue-rotate(15deg)" },
          "66%": { filter: "hue-rotate(-15deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
