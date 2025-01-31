// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/widget/index.tsx', // Your entry point
  output: {
    file: 'dist/widget.bundle.js',
    format: 'umd', // Universal module definition
    name: 'ChatbotWidget', // Global variable name
    globals: {
      react: 'React',
      // Note: Even though we import createRoot from 'react-dom/client',
      // the external dependency is usually declared as 'react-dom'
      // if your consumers already load react-dom.
      'react-dom/client': 'ReactDOMClient'
    },
  },
  external: ['react', 'react-dom', 'react-dom/client'],
  plugins: [
    // Allow Rollup to resolve .js, .jsx, .ts, and .tsx files
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json', // Ensure this points to your tsconfig
      // You can also specify include patterns if needed:
      // include: ['src/**/*']
    }),
    terser() // Optional: for minification
  ],
};
