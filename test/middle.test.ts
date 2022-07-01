import { describe, expect, it } from 'vitest'
import { build } from 'esbuild'
import plugin from '../src/index'
describe('esbuild', () => {
  it('build', async () => {
    const result = await build({
      bundle: true,
      entryPoints: ['./fixture/example.vue'],
      plugins: [plugin()],
      write: false,
    })
    const src = String.fromCodePoint(...result.outputFiles[0].contents)
    expect(result.outputFiles).toHaveLength(1)
    expect(src).contain('232')
  })
})
