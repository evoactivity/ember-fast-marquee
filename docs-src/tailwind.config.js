'use strict';
// located in <app root>/config/tailwind/
const defaultTheme = require('tailwindcss/defaultTheme');

const path = require('path');

const appEntry = path.join(__dirname, 'app');
const relevantFilesGlob = '**/*.{html,js,ts,hbs,gjs,gts}';

module.exports = {
  content: [path.join(appEntry, relevantFilesGlob)],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'ember-gray': {
          900: '#1c1e24',
        },
        'ember-orange': {
          DEFAULT: '#E34C32',
          50: '#FCE9E8',
          100: '#F9D6D4',
          200: '#F4B2AB',
          300: '#EE8F83',
          400: '#E96D5A',
          500: '#E34C32',
          600: '#CB391C',
          700: '#A33016',
          800: '#7B2611',
          900: '#521B0B',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
