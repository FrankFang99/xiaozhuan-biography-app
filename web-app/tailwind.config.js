/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'bg': {
          'page': '#F5F7FA',
          'card': '#FFFFFF',
          'hover': '#F0F2F5',
        },
        'text': {
          'primary': '#1A1A1A',
          'secondary': '#555555',
          'tertiary': '#999999',
          'placeholder': '#CCCCCC',
        },
        'brand': {
          'gold': '#D4A853',
          'gold-light': '#F4D06F',
          'gold-glow': '#FFE49E',
          'red': '#C73E3A',
          'red-light': '#E85D52',
        },
        'accent': {
          'blue': '#2B5CAE',
          'green': '#2E7D88',
          'mint': '#5EC2A8',
        },
        'border': {
          'light': '#EEEEEE',
          'medium': '#E0E0E0',
          'dark': '#D0D0D0',
        },
        'starry': {
          'dark': '#050A14',
          'deep': '#0A1628',
          'mid': '#0D1F3C',
        },
      },
      fontFamily: {
        'serif': ['Noto Serif SC', 'Microsoft YaHei', 'serif'],
        'sans': ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'star-birthday': 'star-birthday 2.5s ease-in-out infinite',
        'float': 'float 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.8s ease-out forwards',
        'reveal': 'reveal 0.6s ease-out forwards',
        'slide-in': 'slide-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        'star-birthday': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-up': {
          'from': { opacity: '0', transform: 'translateY(40px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.9)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'phone': '0 16px 48px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        'bottom': '0 -2px 12px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
