import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Busca en la carpeta app
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // (Por si acaso)
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // (Por si acaso)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
