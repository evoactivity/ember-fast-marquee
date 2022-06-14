const env = process.env.EMBER_ENV || 'development';

const plugins = [
  require('postcss-easy-import'),
  require('postcss-simple-vars'),
  require('tailwindcss/nesting'),
  require('postcss-hexrgba'),
  require('postcss-easing-gradients'),
  require('postcss-responsive-type'),
  require('tailwindcss')({ config: './tailwind.config.js' }),
  require('autoprefixer'),
];

if (env === 'production') {
  plugins.push(
    require('cssnano')({
      preset: 'default',
    })
  );
}

module.exports = {
  // map: { absolute: true, inline: true },
  plugins,
};
