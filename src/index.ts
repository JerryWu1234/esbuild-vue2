import { relative } from 'path'
import type { OnLoadResult, Plugin } from 'esbuild'
import type { AssembleOptions, ScriptOptions, StyleOptions, TemplateOptions } from '@vue/component-compiler'
import type { CompilerResult, StylesType } from './compiler'
import { codeAssemble, compiler } from './compiler'

const STATIC_QUERY = '?esbuildvue-css'
interface EsbuildError {
  text: string
  detail: any
}

interface CreateDefaultCompiler {
  script?: ScriptOptions | undefined
  style?: StyleOptions | undefined
  template?: TemplateOptions | undefined
}

export interface Option {
  extractscss?: boolean
  createCompilerOption?: CreateDefaultCompiler
  assembleOptions?: AssembleOptions
}
export interface Context {
  option: Option
  cssMap: Map<string, string>
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
      const result = compiler(path, filename, context)
      const error = handleError(result)
      if (error?.length)
        return { errors: error } as OnLoadResult

      getExtractscss(result.styles, context, queryFilename)

      return codeAssemble(result, filename, context, (code) => {
        handleExtract(result, context)
        return context.option.extractscss ? addCode(code, queryFilename) : code
      }) as OnLoadResult
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

    function handleError(result: CompilerResult) {
      if (result.template?.errors.length) {
        return result.template.errors.map(message => ({
          text: message,
          detail: message,
        }))
      }

      if (result.styles.length > 0) {
        const errorList: EsbuildError[] = []
        result.styles.forEach((style) => {
          if (style.errors.length) {
            const error = {
              text: '',
              detail: '',
            }
            style.errors.forEach((e: any) => {
              error.text = `error msg: ${e.reason}}, colunm: ${e.colunm}, line: ${e.line}`
              error.detail = e
              errorList.push(error)
            })
          }
        })
        return errorList
      }
      return null
    }
  },
})

