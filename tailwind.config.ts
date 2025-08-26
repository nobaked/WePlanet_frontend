import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1C7ED6",
          green: "#40C057",
          gradientStart: "#60A5FA",
          gradientMid: "#34D399",
          gradientEnd: "#2563EB"
        }
      },
      boxShadow: {
        card: "0 10px 40px rgba(0,0,0,0.15)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};
export default config;
