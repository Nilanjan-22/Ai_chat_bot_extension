/** @type {import('tailwindcss').Config} */
export default {
  content: ["./extension/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        sand: "#f5efe3",
        clay: "#d97706",
        moss: "#14532d",
        mist: "#e2e8f0"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(23, 32, 51, 0.14)"
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "\"Times New Roman\"", "serif"],
        body: ["\"Segoe UI\"", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
};

