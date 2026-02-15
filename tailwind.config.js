/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0a181e',
        charcoal: '#0B1220',
        'brand-orange': '#FF5A1F',
        'brand-orange-bg': '#FFE6DE',
        'background-light': '#f6f7f8',
        'background-dark': '#141b1e',
        skeleton: '#e6eaf0',
        'border-grey': '#E6EAF0',
        'error-red': '#E5484D',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'system-ui', 'sans-serif'],
        'sans-medium': ['Inter_500Medium', 'system-ui', 'sans-serif'],
        'sans-semibold': ['Inter_600SemiBold', 'system-ui', 'sans-serif'],
        'sans-bold': ['Inter_700Bold', 'system-ui', 'sans-serif'],
        'sans-extrabold': ['Inter_800ExtraBold', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
