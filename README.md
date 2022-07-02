# esbuild-vue2
在 esbuild 中编译vue2.0的文件

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