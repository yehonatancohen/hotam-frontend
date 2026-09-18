/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f3f3ef',
        'paper-2': '#e8e8e2',
        sheet: '#ffffff',
        ink: '#1d1d1f',
        'ink-2': '#45464b',
        'ink-3': '#64656b',
        blue: '#0078bf',
        'blue-deep': '#005a91',
        'on-blue-2': '#d6ecfa',
        pink: '#ff48b0',
        'pink-deep': '#e0318f',
        yellow: '#ffe800',
        danger: '#c4122f',
        success: '#0f7a3d',
      },
      fontFamily: {
        display: ['Karantina', 'Rubik', 'sans-serif'],
        ui: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
