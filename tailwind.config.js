/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        primary: '#C84B31',
        background: '#F9F8F6',
        surface: '#161A30',
        ink: '#2B2B2B',
        muted: '#948F87',
        parchment: '#E9DCC9',
        cream: '#fcf9f8',
        'on-surface-variant': '#5d4039',
        'surface-container': '#f8f1ef',
        'surface-container-high': '#f0e6e3',
        'surface-bright': '#fcf9f8',
        'inverse-surface': '#161A30',
        'surface-container-low': '#fcf9f8',
        'surface-container-lowest': '#ffffff',
        'surface-container-highest': '#e9dcc9',
        'outline-variant': '#E9DCC9',
        'tertiary-container': '#E9DCC9',
        'on-primary': '#ffffff',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        float: '0 20px 40px rgba(22, 26, 48, 0.15)',
      },
    },
  },
  plugins: [],
};
