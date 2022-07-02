import { relative } from 'path'
import type { Plugin } from 'esbuild'
import type { CompilerResult, StylesType } from './compiler'
import { codeAssemble, compiler } from './compiler'

const STATIC_QUERY = '?esbuildvue-css'
interface Result {
  loader: 'js' | 'ts'
  contents: string
}
export interface Option {
  extractscss: boolean
}

export default (option: Option = { extractscss: false }): Plugin => ({
  name: 'esbuild-vue2',
  setup(build) {
    const context = {
      option,
      cssMap: new Map(),
    }

    build.onLoad({ filter: /[^/]\.vue$/ }, ({ path }) => {
      const filename = `${relative(process.cwd(), path)}`
      const queryFilename = `${filename}${STATIC_QUERY}`
      const result = compiler(path, filename)

      getExtractscss(result.styles, context, queryFilename)
      handleExtract(result, context)

      return codeAssemble(result, filename, code => context.option.extractscss ? addCode(code, queryFilename) : code) as Result
    })

    if (context.option.extractscss) {
      build.onResolve({ filter: /esbuildvue-css$/ }, ({ path }) => {
        return { path, namespace: STATIC_QUERY }
      })

      build.onLoad({ filter: /esbuildvue-css$/, namespace: STATIC_QUERY }, ({ path }) => {
        const css = context.cssMap.get(path)
        if (!css)
          return null

        return {
          contents: css,
          loader: 'css',
        }
      })
    }
    function handleExtract(result: CompilerResult, ctx: typeof context) {
      if (ctx.option.extractscss && result.styles)
        result.styles = []
    }
    function getExtractscss(style: StylesType, ctx: typeof context, filename: string) {
      if (ctx.option.extractscss && style && style?.length)
        ctx.cssMap.set(filename, style.reduce((total, { code }) => total + code, ''))
    }

    function addCode(code: string, filename: string) {
      return code += `\n import '${filename}'\n `
    }
  },
})

