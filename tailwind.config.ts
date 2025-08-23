import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      fontFamily: { sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"] },
      colors: {
        // Palette sobre + lisible (contraste élevé)
        ink: {
          50: "#f7f7f8",
          100: "#eeeff1",
          200: "#d9dbe0",
          300: "#b9bcc5",
          400: "#8a90a0",
          500: "#61697a",
          600: "#474e5d",
          700: "#363c48",
          800: "#2b3038",
          900: "#1f232a",
          950: "#15181d"
        },
        accent: {
          500: "#5eead4"
        }
      }
    }
  },
  plugins: []
};
export default config;
