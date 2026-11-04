/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    opacity: { 35: '.35', 55: '.55', 85: '.85' },
    colors: { navy: '#0F2A4A', ocean: '#2E86DE', leaf: '#27AE60', ink: '#1B2B3F', muted: '#6B7A90', line: '#DDE4EE', ground: '#F4F7FB' },
    fontFamily: { sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'], mono: ['"JetBrains Mono"', 'monospace'] },
    boxShadow: { card: '0 2px 12px rgba(15,42,74,.06)', lift: '0 12px 28px rgba(15,42,74,.12)' },
    keyframes: {
      pulse2: { '0%,100%': { opacity: 1 }, '50%': { opacity: .3 } },
      scan: { '0%': { top: '-2px' }, '100%': { top: '100%' } },
      fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
      toast: { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'none' } },
      blink: { '0%,49%': { opacity: 1 }, '50%,100%': { opacity: 0 } },
    },
    animation: { pulse2: 'pulse2 2s infinite', scan: 'scan 5s linear infinite', fadeIn: 'fadeIn .3s ease', toast: 'toast .3s ease', blink: 'blink 1s infinite' },
  } },
  plugins: [],
}
