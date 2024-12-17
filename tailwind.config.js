/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber': {
          primary: '#00fff5',
          secondary: '#ff00ff',
          accent: '#ffff00',
          dark: '#0a0a0f',
          'dark-blue': '#0f1729',
          'gray-dark': '#1a1a2e',
          'gray-light': '#2a2a3e'
        }
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.cyber.primary), 0 0 20px theme(colors.cyber.primary)',
        'neon-strong': '0 0 5px theme(colors.cyber.primary), 0 0 20px theme(colors.cyber.primary), 0 0 40px theme(colors.cyber.primary)',
        'neon-pink': '0 0 5px theme(colors.cyber.secondary), 0 0 20px theme(colors.cyber.secondary)',
      },
      animation: {
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'scan-line': 'scan-line 2s linear infinite',
      },
      keyframes: {
        glow: {
          'from': { 'text-shadow': '0 0 10px #fff, 0 0 20px #fff, 0 0 30px theme(colors.cyber.primary), 0 0 40px theme(colors.cyber.primary)' },
          'to': { 'text-shadow': '0 0 20px #fff, 0 0 30px theme(colors.cyber.accent), 0 0 40px theme(colors.cyber.accent), 0 0 50px theme(colors.cyber.accent)' }
        },
        'scan-line': {
          'from': { transform: 'translateY(-100%)' },
          'to': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
}
