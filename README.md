# esbuild-vue2
在 esbuild 中编译vue2.0的文件


[![OSCS Status](https://www.oscs1024.com/platform/badge/wulinsheng123/esbuild-vue2.svg?size=small)](https://www.oscs1024.com/project/wulinsheng123/esbuild-vue2?ref=badge_small)



# 使用方式
```js
import { build } from 'esbuild'

build({
  plugins: [plugin()]
})

```

# 插件参数

#### extractscss

* type:Boolean
* default: false

编译时单独编译 vue 文件里的 css

#### createCompilerOption

* type: Options
* default: {}
```ts
interface Options {
  script?: ScriptOptions | undefined
  style?: StyleOptions | undefined
  template?: TemplateOptions | undefined
}
```
引用 [@vue/component-compiler](https://www.npmjs.com/package/@vue/component-compiler) 的参数

#### AssembleOptions

* type: AssembleOptions
* default: {}
```ts
interface AssembleOptions {
  isWebComponent?: boolean
  normalizer?: string
  styleInjector?: string
  styleInjectorSSR?: string
  styleInjectorShadow?: string
}
```
引用 [@vue/component-compiler](https://www.npmjs.com/package/@vue/component-compiler) 的参数