import type { Config } from "tailwindcss";

// Tailwind CSS v4 uses a different configuration approach
// For RTL support in v4, use CSS or add dir="rtl" to your HTML element
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // In Tailwind v4, plugins are added via CSS @plugin directive
  // For RTL support, use CSS or set dir="rtl" on your HTML element
  plugins: [],
};

export default config;
