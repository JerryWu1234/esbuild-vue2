import { readFileSync } from 'fs'
import { parse } from 'path'
import componentCompiler from '@vue/component-compiler'
import tempcompiler from 'vue-template-compiler'
import compilerUtil from '@vue/component-compiler-utils'
import hashSum from 'hash-sum'

const getbasename = (sourcePath: string) => parse(sourcePath).base

export function compiler(sourcePath: string) {
  const filename = getbasename(sourcePath)
  const sourceCode = readFileSync(sourcePath, { encoding: 'utf-8' })
  const scopeId = hashSum(sourcePath)
  const descriptor = compilerUtil.parse({
    source: sourceCode,
    needMap: true,
    filename,
    compiler: tempcompiler as any,
  })

  const compiler = componentCompiler.createDefaultCompiler()

  const template = descriptor.template ? compiler.compileTemplate(filename, descriptor.template) : undefined
  const styles = descriptor.styles.map(style => compiler.compileStyle(filename, scopeId, style))
  const { script: rawScript, customBlocks } = descriptor
  const script = rawScript ? { code: rawScript.content, map: rawScript.map, lang: rawScript.lang } : undefined

  const { code } = componentCompiler.assemble(compiler, filename, {
    scopeId,
    template,
    styles,
    script,
    customBlocks,
  })
  return {
    code,
    loader: script ? script.lang : undefined,
  }
}
