/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./templates/**/*.{html,js}"],
  theme: {
    extend: {
      opacity: {
        default: 1,
      },
      colors: {
        gray: {
          100: 'rgba(236,236,241)',
          800: 'rgba(52,53,65)',
          700: 'rgba(64,65,79)',
          900: 'rgba(32,33,35)',
        }
      },
    }

  },
  plugins: [],
}

