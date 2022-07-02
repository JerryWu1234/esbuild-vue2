import { describe, expect, it } from 'vitest'
import { build } from 'esbuild'
import plugin from '../src/index'
describe('esbuild', () => {
  it('build', async () => {
    const result = await build({
      bundle: true,
      outdir: './dist',
      entryPoints: ['./fixture/example.vue'],
      plugins: [plugin({ extractscss: true })],
      write: false,
    })
    const src = String.fromCodePoint(...result.outputFiles[0].contents)
    expect(result.outputFiles).toHaveLength(2)
    expect(src).contain('232')
  })
  it('error', async () => {
    try {
      await build({
        bundle: true,
        outdir: './dist',
        entryPoints: ['./fixture/error.vue'],
        plugins: [plugin({ extractscss: true })],
        write: false,
      })
    }
    catch (e) {
      expect(e.message).toContain('tag <div> has no matching end tag')
    }
  })
})
