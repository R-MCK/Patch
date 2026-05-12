/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        display: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        earth: {
          50: '#faf6f1',
          100: '#f0e6d8',
          200: '#e0ccb0',
          300: '#cdab82',
          400: '#bc8d5d',
          500: '#b07a4a',
          600: '#9a633f',
          700: '#7d4d36',
          800: '#684132',
          900: '#58382c',
          950: '#311c16',
        },
        leaf: {
          50: '#f4faf3',
          100: '#e5f4e3',
          200: '#cbe9c8',
          300: '#a3d69d',
          400: '#72bc6a',
          500: '#4fa046',
          600: '#3d8436',
          700: '#33682d',
          800: '#2c5428',
          900: '#264523',
          950: '#10250f',
        },
        cottage: {
          cream: 'var(--cottage-cream)',
          moss: 'var(--cottage-moss)',
          rust: 'var(--cottage-rust)',
          ink: 'var(--cottage-ink)',
          stone: 'var(--cottage-stone)',
          overdue: 'var(--cottage-overdue)',
          'overdue-soft': 'var(--cottage-overdue-soft)',
          weather: 'var(--cottage-weather-chip)',
          'bg-1': 'var(--cottage-bg-1)',
          'bg-2': 'var(--cottage-bg-2)',
          'bg-3': 'var(--cottage-bg-3)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'plant-bounce': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        sway: 'sway 4s ease-in-out infinite',
        'plant-bounce': 'plant-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      }
    },
  },
  plugins: [],
}
