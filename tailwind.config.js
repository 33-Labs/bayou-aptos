module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aptos-green': '#2FD8A7',
        'aptos-green-dark': '#3DAD8C'
      },
      fontFamily: {
        'flow': ['acumin-pro', 'sans-serif'],
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}