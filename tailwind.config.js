module.exports = {
  content: ['./pages/*.html', './src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        display: [
          'ui-rounded',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
