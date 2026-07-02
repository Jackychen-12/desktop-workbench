/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: { 50: "#f0f5ff", 100: "#dce8ff", 200: "#b4ccff", 400: "#5b8af5", 500: "#3b6cf5", 600: "#2952d9", 700: "#1e3fa6" },
        surface: { DEFAULT: "#ffffff", 2: "#f8f9fa", 3: "#f1f3f5" },
        "surface-dark": { DEFAULT: "#1a1b1e", 2: "#25262b", 3: "#2c2e33" },
      },
      fontFamily: { sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "PingFang SC", "Microsoft YaHei", "sans-serif"] },
    },
  },
  plugins: [],
};
