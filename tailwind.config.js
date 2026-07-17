/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        serif: ['var(--font-heading)'],
      },
      borderRadius: {
        'dp-xs': 'var(--dp-radius-xs)',
        'dp-sm': 'var(--dp-radius-sm)',
        'dp-md': 'var(--dp-radius-md)',
        'dp-lg': 'var(--dp-radius-lg)',
        'dp-xl': 'var(--dp-radius-xl)',
        'dp-sheet': 'var(--dp-radius-sheet)',
        'dp-native-sheet': 'var(--dp-radius-native-sheet)',
        lg: 'var(--dp-radius-lg)',
        md: 'var(--dp-radius-md)',
        sm: 'var(--dp-radius-sm)'
      },
      letterSpacing: {
        tightest: '0',
        tighter: '0',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        dp: {
          primary: 'var(--dp-color-primary)',
          secondary: 'var(--dp-color-secondary)',
          accent: 'var(--dp-color-accent)',
          surface: 'var(--dp-surface-1)',
          background: 'var(--dp-surface-0)',
          border: 'var(--dp-border)',
          success: 'var(--dp-success)',
          warning: 'var(--dp-warning)',
          error: 'var(--dp-error)',
        },
        gold: {
          DEFAULT: 'var(--dp-gold-500)',
          light: 'var(--dp-gold-100)',
          dark: 'var(--dp-gold-500)',
          muted: 'var(--dp-gold-100)',
        },
        navy: {
          DEFAULT: 'var(--dp-navy-900)',
          deep: 'var(--dp-navy-900)',
          light: 'var(--dp-navy-700)',
          mid: 'var(--dp-navy-500)',
          pale: 'var(--dp-neutral-50)',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pin-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'pin-pulse': 'pin-pulse 2.4s ease-in-out infinite',
      },
      boxShadow: {
        'dp-sm': 'var(--dp-shadow-sm)',
        'dp': 'var(--dp-shadow-md)',
        'dp-lg': 'var(--dp-shadow-lg)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
