import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript';

import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    }
  ],
  external: ['fs', 'path', ...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    typescript(),
    replace({
      'process.env.PKG_VERSION': JSON.stringify(pkg.version),
      'process.env.PKG_DESCRIPTION': JSON.stringify(pkg.description)
    })
  ]
};
