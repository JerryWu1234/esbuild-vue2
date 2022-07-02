import { readFileSync } from 'fs'
import componentCompiler from '@vue/component-compiler'
import tempcompiler from 'vue-template-compiler'
import compilerUtil from '@vue/component-compiler-utils'
import hashSum from 'hash-sum'

export type StylesType = componentCompiler.StyleCompileResult[]
export type TemplateType = (compilerUtil.TemplateCompileResult & { functional: boolean }) | undefined
export type scriptType = {
  code: string
  map: compilerUtil.SFCBlock['map'] | undefined
  lang: string | undefined
} | undefined

export type CallbackInterface = (
  styles: StylesType,
  template: TemplateType,
  script: scriptType
) => void

export interface CompilerResult {
  scopeId: string
  styles: StylesType
  script: scriptType
  template: TemplateType
  customBlocks: compilerUtil.SFCCustomBlock[]
  compiler: componentCompiler.SFCCompiler
}

export function compiler(sourcePath: string, filename: string, callback?: CallbackInterface) {
  const sourceCode = readFileSync(sourcePath, { encoding: 'utf-8' })
  const scopeId = `data-v-${hashSum(sourcePath)}`
  const descriptor = compilerUtil.parse({
    source: sourceCode,
    needMap: true,
    filename,
    compiler: tempcompiler as any,
  })

  const compiler = componentCompiler.createDefaultCompiler()

  const styles = descriptor.styles.map(style => compiler.compileStyle(filename, scopeId, style))
  const template = descriptor.template ? compiler.compileTemplate(filename, descriptor.template) : undefined
  const { script: rawScript, customBlocks } = descriptor
  const script = rawScript ? { code: rawScript.content, map: rawScript.map, lang: rawScript.lang } : undefined

  return {
    compiler,
    scopeId,
    styles,
    template,
    script,
    customBlocks,
  }
}

export function codeAssemble(assembleOption: CompilerResult, filename: string, callback: (code: string) => string) {
  const { code } = componentCompiler.assemble(assembleOption.compiler, filename, assembleOption)
  return {
    contents: callback(code),
    loader: assembleOption.script?.lang,
  }
}
