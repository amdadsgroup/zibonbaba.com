import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFC107',
          accent: '#FFB800',
          dark: '#E0A800',
        },
        neutral: {
          dark: '#1F2937',
          body: '#4B5563',
          muted: '#9CA3AF',
          light: '#F8F9FA',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      borderRadius: {
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(31, 41, 55, 0.05), 0 1px 2px rgba(31, 41, 55, 0.03)',
        megamenu: '0 4px 6px -1px rgba(31, 41, 55, 0.08), 0 2px 4px -1px rgba(31, 41, 55, 0.04)',
        modal: '0 10px 15px -3px rgba(31, 41, 55, 0.1), 0 4px 6px -2px rgba(31, 41, 55, 0.05)',
        glow: '0 0 12px rgba(255, 193, 7, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
