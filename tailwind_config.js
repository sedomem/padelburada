/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kinetic Precision Design System
        primary: "#C3F400",
        "primary-dim": "#ABD600",
        "primary-container": "#C3F400",
        "on-primary": "#283500",
        surface: "#131313",
        "surface-low": "#1C1B1B",
        "surface-high": "#2A2A2A",
        "surface-highest": "#353534",
        "surface-lowest": "#0E0E0E",
        "on-surface": "#E5E2E1",
        "on-surface-variant": "#C4C9AC",
        "outline-variant": "#444933",
      },
      fontFamily: {
        display: ["'Public Sans'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #C3F400 0%, #ABD600 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
