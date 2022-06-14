'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const isProduction = EmberApp.env() === 'production';

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    splitAtRoutes: ['application', 'demo'],
    packagerOptions: {
      publicAssetURL: isProduction ? '/' : '/',
      cssLoaderOptions: {
        sourceMap: isProduction === false,
        modules: {
          mode: 'global',
          localIdentName: isProduction
            ? '[sha512:hash:base64:5]'
            : '[path][name]__[local]',
        },
      },
      webpackConfig: {
        // plugins: [new BundleAnalyzerPlugin()],
        module: {
          rules: [
            {
              test: /\.(png|jpe?g|gif)$/i,
              loader: 'responsive-loader',
              options: {
                adapter: require('responsive-loader/sharp'),
              },
            },
            {
              test: /\.css$/i,
              exclude: /node_modules/,
              use: [
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: isProduction === false,
                    postcssOptions: {
                      config: './postcss.config.js',
                    },
                  },
                },
              ],
            },
            {
              test: /\.(woff|woff2|eot|ttf|otf)$/i,
              type: 'asset/resource',
            },
            {
              test: /\.(svg)$/i,
              type: 'asset',
            },
          ],
        },
      },
    },
  });
};
