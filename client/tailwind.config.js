export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          primary: '#E8420A',
          'primary-light': '#FF6B35',
          'primary-dark': '#C13508',
          'primary-bg': '#FFF2EE',
          navy: '#1A1A2E',
          'navy-deep': '#16213E',
          'navy-accent': '#0F3460',
          gold: '#F7C948',
          'gold-dark': '#D4A017',
          surface: '#F4F3EE',
          border: '#E2E2DE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        pill: '9999px',
      },
      fontSize: {
        display: ['32px', { lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.02em' }],
        h1: ['26px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '1.3', fontWeight: '700' }],
        h3: ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['12px', { lineHeight: '1.5' }],
        label: ['10px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.07em' }],
      },
    },
  },
  plugins: [],
}
