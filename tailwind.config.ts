import type { Config } from 'tailwindcss'

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
          DEFAULT: '#819A91',
          hover: '#A7C1A8',
          dark: '#4A5A53',
        },
        secondary: {
          DEFAULT: '#D1D8BE',
          light: '#EEEFE0',
          lighter: '#F5F6F0',
        },
        error: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
        }
      },
      fontFamily: {
        'sans': ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-lora)', 'serif'],
        'accent': ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config 