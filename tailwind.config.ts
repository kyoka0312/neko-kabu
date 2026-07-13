import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F1E6",
        paperDeep: "#EDE6D3",
        ink: "#26241E",
        line: "#D9CFB4",
        catAccent: "#C1694F",
        catAccentSoft: "#F1DCD2",
        beetleAccent: "#3F5D3A",
        beetleAccentSoft: "#DCE3CE",
        amber: "#B8862E",
      },
      fontFamily: {
        serif: ["'Shippori Mincho'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        hand: ["'Klee One'", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
