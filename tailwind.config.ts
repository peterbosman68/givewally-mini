import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          700: "#16305e",
          800: "#0f2247",
          900: "#0a1830",
          950: "#050b17",
        },
        gold: {
          300: "#f0d98e",
          400: "#e6c465",
          500: "#d4a537",
          600: "#b8862f",
        },
        background: "#f7f7f5",
      },
    },
  },
  plugins: [],
};

export default config;
