/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f3',
          100: '#ffe4e8',
          200: '#ffccd5',
          300: '#ffa3b5',
          400: '#ff6b8a',
          500: '#f83a68',
          600: '#e51a4f',
          700: '#c21041',
          800: '#a2103a',
          900: '#8a1237',
        },
        // Chinese stock convention: red = up, green = down
        // Using hex directly in CSS to avoid Tailwind circular-dep issues
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
