import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./apps/legacy-client/index.html",
    "./apps/legacy-client/App.tsx",
    "./apps/legacy-client/index.tsx",
    "./apps/legacy-client/components/**/*.{js,ts,jsx,tsx}",
    "./apps/legacy-client/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      brand: {
        primary: "#1E40AF", // Deep Blue (IAU2 inspired)
        primary_hover: "#1E3A8A", // Darker Blue
        secondary: "#3B82F6", // Bright Blue
        accent: "#60A5FA", // Light Blue
        tertiary: "#10B981", // Teal/Green (keeping for success states)
      },
      neutrals: {
        background_main: "#050505", // Deep Black
        background_secondary: "#0A0A0A", // Very Dark Grey
        background_card: "#121212", // Dark Card
        text_primary: "#FFFFFF",
        text_secondary: "#A3A3A3",
        text_muted: "#52525B",
        border: "#262626",
      },
      feedback: {
        success: "#CCFF00",
        warning: "#FACC15",
        error: "#EF4444",
      },
    },
    fontFamily: {
      display: ["Montserrat", "sans-serif"],
      body: ["Roboto", "sans-serif"],
      primary: ["Inter", "Montserrat", "sans-serif"],
      secondary: ["Roboto", "sans-serif"],
    },
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "16px",
      pill: "9999px",
    },
    boxShadow: {
      card: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
      button: "0 0 20px rgba(30, 64, 175, 0.5)", // Blue glow
      'button-hover': "0 0 30px rgba(30, 64, 175, 0.7)",
      'glow-secondary': "0 0 20px rgba(59, 130, 246, 0.3)", // Bright blue glow
    },
    backgroundImage: {
      "primary-gradient": "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)", // Deep to Bright Blue
      "dark-overlay": "linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,1) 100%)",
      "text-gradient": "linear-gradient(to right, #1E40AF, #3B82F6, #60A5FA)", // Blue gradient
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
      xxl: "64px",
      section_padding: "80px",
    },
    extend: {
      animation: {
        marquee: 'marquee 40s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    daisyui,
    typography,
  ],
}