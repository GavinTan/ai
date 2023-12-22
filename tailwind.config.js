/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.{html,js}"],
  theme: {
    extend: {
      opacity: {
        default: 1,
      },
      colors: {
        gray: {
          100: "rgba(236,236,241)",
          700: "rgba(64,65,79)",
          800: "rgba(52,53,65)",
          900: "rgba(32,33,35)",
        },
      },
      boxShadow: {
        neutral:
          "0 0 0 2px #fff,0 0 0 4px rgba(69, 89, 164, .5),0 0 transparent",
      },
    },
  },
  plugins: [],
};
