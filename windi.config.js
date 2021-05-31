module.exports = {
  theme: {
    extend: {
      colors: {
        darkened: {
          100: 'rgba(0,0,0,0.1)',
          200: 'rgba(0,0,0,0.2)',
          300: 'rgba(0,0,0,0.3)',
          400: 'rgba(0,0,0,0.4)',
          500: 'rgba(0,0,0,0.5)',
          600: 'rgba(0,0,0,0.6)',
          700: 'rgba(0,0,0,0.7)',
          800: 'rgba(0,0,0,0.8)',
          900: 'rgba(0,0,0,0.9)'
        },
        primary: {
          light: '#BCE0FD',
          DEFAULT: '#10A9EB'
        }
      }
    }
  },
  shortcuts: {},
  plugins: [
    require('windicss/plugin/aspect-ratio'),
    require('windicss/plugin/forms'), // used
    require('windicss/plugin/line-clamp') // used
  ]
}