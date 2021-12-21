module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        xxl: '1600px',
        '2xl': '1600px',
        xxxl: '2000px',
        '3xl': '2000px',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
