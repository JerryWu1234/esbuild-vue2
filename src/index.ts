import type { Plugin } from 'esbuild'
import { compiler } from './compiler'

type Loader = 'js' | 'ts'

export default (): Plugin => ({
  name: 'esbuild-vue2',
  setup(build) {
    build.onLoad({ filter: /[^/]\.vue$/ }, ({ path }) => {
      const result = compiler(path)
      return {
        contents: result.code,
        loader: result?.loader as Loader,
      }
    })
  },

})

