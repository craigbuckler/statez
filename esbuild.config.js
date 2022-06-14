// esbuild configuration
import { argv } from 'node:process';
import esbuild from 'esbuild';
import pkg from './package.json' assert {type: 'json'};

const productionMode = ('development' !== (argv[2] || process.env.NODE_ENV));

// minified build
esbuild.build({

  entryPoints: [ './src/statez.js' ],
  platform: 'browser',
  format: 'esm',
  bundle: true,
  minify: productionMode,
  sourcemap: !productionMode && 'linked',
  banner: { js: `/* ${ pkg.name } ${ pkg.version }, by ${ pkg.author }, ${ (new Date()).toISOString().slice(0,-8) } */` },
  outfile: './dist/statez.js',
  watch: !productionMode

}).catch(() => process.exit(1));
