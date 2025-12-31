const colors = require('tailwindcss/colors')
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Keep Tailwind defaults AND add your custom colors
        primary: colors.sky[700],
        secondary: colors.slate[600],
        dark: colors.slate[900],
        light: colors.slate[200],
        white: colors.slate[50],
        error: colors.red[700],
        
        // Custom color system integration
        ocean: {
          50: 'var(--color-ocean-50)',
          100: 'var(--color-ocean-100)',
          200: 'var(--color-ocean-200)',
          300: 'var(--color-ocean-300)',
          400: 'var(--color-ocean-400)',
          500: 'var(--color-ocean-500)',
          600: 'var(--color-ocean-600)',
          700: 'var(--color-ocean-700)',
          800: 'var(--color-ocean-800)',
          900: 'var(--color-ocean-900)',
        },
        earth: {
          50: 'var(--color-earth-50)',
          100: 'var(--color-earth-100)',
          200: 'var(--color-earth-200)',
          300: 'var(--color-earth-300)',
          400: 'var(--color-earth-400)',
          500: 'var(--color-earth-500)',
          600: 'var(--color-earth-600)',
          700: 'var(--color-earth-700)',
          800: 'var(--color-earth-800)',
          900: 'var(--color-earth-900)',
        },
        forest: {
          50: 'var(--color-forest-50)',
          100: 'var(--color-forest-100)',
          200: 'var(--color-forest-200)',
          300: 'var(--color-forest-300)',
          400: 'var(--color-forest-400)',
          500: 'var(--color-forest-500)',
          600: 'var(--color-forest-600)',
          700: 'var(--color-forest-700)',
          800: 'var(--color-forest-800)',
          900: 'var(--color-forest-900)',
        },
        sky: {
          50: 'var(--color-sky-50)',
          100: 'var(--color-sky-100)',
          200: 'var(--color-sky-200)',
          300: 'var(--color-sky-300)',
          400: 'var(--color-sky-400)',
          500: 'var(--color-sky-500)',
          600: 'var(--color-sky-600)',
          700: 'var(--color-sky-700)',
          800: 'var(--color-sky-800)',
          900: 'var(--color-sky-900)',
        },
        sunset: {
          50: 'var(--color-sunset-50)',
          100: 'var(--color-sunset-100)',
          200: 'var(--color-sunset-200)',
          300: 'var(--color-sunset-300)',
          400: 'var(--color-sunset-400)',
          500: 'var(--color-sunset-500)',
          600: 'var(--color-sunset-600)',
          700: 'var(--color-sunset-700)',
          800: 'var(--color-sunset-800)',
          900: 'var(--color-sunset-900)',
        },
        conservation: 'var(--color-conservation)',
        'soil-health': 'var(--color-soil-health)',
        environmental: 'var(--color-environmental)',
        assessment: 'var(--color-assessment)',
        mapping: 'var(--color-mapping)',
      },
      fontSize: {
        base: ['18px', '24px'],
      },
      fontFamily: {
        sans: ['var(--font-catamaran)', ...fontFamily.sans],
      },
    },

  },
  plugins: [],
}
