/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,svelte}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0f",
        panel: "#111117",
        soft: "#18181f",
        accent: "#5b8cff",
        accent2: "#7c3aed"
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.4)"
      }
    },
  },
  plugins: [],
}