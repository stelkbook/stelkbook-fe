import type { Config } from "tailwindcss";

export default {
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
        // Warna list
        red: {
          DEFAULT: '#DC2626',
          500: "#F44336",  // red-500
          700: "#b91c1c",  // red-700
        },
        OldRed: '#B8292D',
        
      },
      gradient: {
        'red-gradient': 'linear-gradient(to bottom, #f87171, #b91c1c)', // Red gradient
        },
      fontFamily: {
        // Poppins font
        sans: ['Poppins', 'sans-serif'],
      },
      // Custom text shadow
      textShadow: {
        lg: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config;

