module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--gradient-color-stops))',
      },
      // colors: {
      //   gray: colors.blueGray,
      //   green: colors.green,
      // },
    },
  },
  plugins: [],
}
