import esbuild from 'rollup-plugin-esbuild'
import terser from '@rollup/plugin-terser'
import { defineConfig } from 'rollup'
import fs from 'fs'
import path from 'path'

const
   inputFile = path.resolve('ts/AGL.ts'),
   banner = (fs.readFileSync(inputFile, 'utf8').match(/^\/\*![\s\S]*?\*\//) || [''])[0],
   beautify = terser({
      compress: false,
      mangle: false,
      format: { comments: false, beautify: true, preamble: banner }
   })

export default defineConfig({
   input: inputFile,
   output: [
      { file: 'js/agl.mjs', format: 'es', sourcemap: true, plugins: [beautify] },
      { name: 'agl', file: 'js/agl.js', format: 'cjs', sourcemap: true, plugins: [beautify] },
      {
         name: 'agl',
         file: 'js/agl.min.js',
         format: 'umd',
         sourcemap: true,
         banner,
         plugins: [terser({ format: { comments: false, preamble: banner } })]
      }
   ],
   plugins: [esbuild({ target: 'es2022' })]
})
