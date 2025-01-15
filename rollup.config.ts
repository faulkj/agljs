import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { defineConfig } from 'rollup'
import fs from 'fs'
import path from 'path'

const inputFile = path.resolve('ts/agl.ts')

function getTopBanner() {
   const source = fs.readFileSync(inputFile, 'utf8')
   // A quick regex to find a top-of-file comment starting with `/*!`
   const match = source.match(/^\/\*![\s\S]*?\*\//)
   return match ? match[0] : ''
}

export default defineConfig([
   {
      input: inputFile,
      output: [
         {
            name: 'agl',
            file: 'js/agl.js',
            format: 'iife',
            sourcemap: true,
            plugins: [
               terser({
                  compress: false,
                  mangle: false,
                  format: {
                     comments: false,
                     beautify: true,
                     preamble: getTopBanner()
                  }
               })
            ]
         },
         {
            name: 'agl',
            file: 'js/agl.min.js',
            format: 'umd',
            sourcemap: true,
            banner: getTopBanner(),
            plugins: [terser({ format: {
               comments: false,
               preamble: getTopBanner()
            } })]
         }
      ],
      plugins: [
         typescript({
            removeComments: true
         })
      ]
   }
])
