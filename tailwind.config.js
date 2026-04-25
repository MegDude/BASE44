/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['var(--dp-font-body)'],
        accent: ['var(--dp-font-accent)'],
        serif: ['"Plus Jakarta Sans"', 'Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '26px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['28px', '36px'],
        '4xl': ['32px', '40px'],
        '5xl': ['40px', '48px'],
        '6xl': ['48px', '56px'],
      },
      spacing: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'dp-card': 'var(--dp-radius-card)',
        'dp-drawer': 'var(--dp-radius-drawer)',
        'dp-pill': 'var(--dp-radius-pill)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        gold: {
          DEFAULT: '#C6A269',
          soft: '#E6CFA3',
          light: '#D8B978',
          dark: '#92713F',
          muted: '#B99B65',
        },
        navy: {
          DEFAULT: '#0B1F33',
          soft: '#1A2E45',
          muted: '#5B6B7C',
          light: '#243B55',
          mid: '#334A60',
          pale: '#E8EDF2',
        },
        surface: {
          base: '#F7F8FA',
          glass: 'rgba(255,255,255,0.6)',
        },
        dp: {
          bg: 'var(--dp-bg)',
          surface: 'var(--dp-surface)',
          'surface-main': 'var(--dp-surface-main)',
          'surface-subtle': 'var(--dp-surface-subtle)',
          navy: 'var(--dp-navy)',
          'navy-soft': 'var(--dp-navy-soft)',
          text: 'var(--dp-text)',
          'text-soft': 'var(--dp-text-soft)',
          gold: 'var(--dp-gold)',
          'gold-deep': 'var(--dp-gold-deep)',
          border: 'var(--dp-border)',
          'border-soft': 'var(--dp-border-soft)',
          hover: 'var(--dp-hover)',
          active: 'var(--dp-active)',
        },
        cream: {
          DEFAULT: 'hsl(42, 24%, 96%)',
          warm: 'hsl(40, 20%, 94%)',
          deep: 'hsl(40, 18%, 88%)',
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
      boxShadow: {
        'dp-soft': 'var(--dp-shadow-soft)',
        'dp-float': 'var(--dp-shadow-float)',
        'dp-glass': 'var(--dp-shadow-glass)',
      },
      backdropBlur: {
        dp: '12px',
        'dp-subtle': '10px',
      },
      transitionDuration: {
        180: '180ms',
        220: '220ms',
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
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
