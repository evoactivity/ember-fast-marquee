import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-ts';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import { Addon } from '@embroider/addon-dev/rollup';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default {
  // This provides defaults that work well alongside `publicEntrypoints` below.
  // You can augment this if you need to.
  output: addon.output(),

  plugins: [
    // These are the modules that users should be able to import from your
    // addon. Anything not listed here may get optimized away.
    addon.publicEntrypoints([
      'components/marquee.ts',
      'modifiers/register-cleanup.ts',
    ]),

    postcss({
      plugins: [autoprefixer()],
      modules: true,
      extract: true,
    }),

    // These are the modules that should get reexported into the traditional
    // "app" tree. Things in here should also be in publicEntrypoints above, but
    // not everything in publicEntrypoints necessarily needs to go here.
    addon.appReexports([
      'components/marquee.js',
      'modifiers/register-cleanup.js',
    ]),

    // This babel config should *not* apply presets or compile away ES modules.
    // It exists only to provide development niceties for you, like automatic
    // template colocation.
    //
    // By default, this will load the actual babel config from the file
    // babel.config.json.
    babel({
      babelHelpers: 'bundled',
    }),

    // compile TypeScript
    typescript({
      transpiler: 'babel',
      browserslist: false,
      transpileOnly: false,
    }),

    // Follow the V2 Addon rules about dependencies. Your code can import from
    // `dependencies` and `peerDependencies` as well as standard Ember-provided
    // package names.
    addon.dependencies(),

    // Ensure that standalone .hbs files are properly integrated as Javascript.
    addon.hbs(),

    // Remove leftover build artifacts when starting a new build.
    addon.clean(),
  ],
};
