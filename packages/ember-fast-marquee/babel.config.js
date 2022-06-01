'use strict';
/* eslint-env node */

const keepSelectors =
  process.env.KEEP_DATA_TEST_SELECTORS === '1' ? true : false;

const babelConfig = {
  presets: [['@babel/preset-typescript']],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-class-properties',
    '@embroider/addon-dev/template-colocation-plugin',
  ],
};

if (!keepSelectors) {
  babelConfig.plugins.push([
    'search-and-replace',
    {
      rules: [
        {
          search: /data-test[a-zA-Z0-9-]*/g,
          replace: '',
        },
      ],
    },
  ]);
}

module.exports = babelConfig;
