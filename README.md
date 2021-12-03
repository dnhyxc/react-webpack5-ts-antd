#### npm i cross-env --save-dev

解决'cross-env' 不是内部或外部命令，也不是可运行的程序的问题

#### cross-env NODE_OPTIONS=--max_old_space_size=4096

动态修改 Node.js 中的内存限制为 4GB

#### rimraf

效果等同于 rm，解决 rm 在 windows 中不是内部命令，无法运行的问题

#### babel-plugin-syntax-dynamic-import

用以解析识别 import()动态导入语法，并非转换，而是解析识别

#### @babel/plugin-proposal-decorators

用于支持类的装饰器语法, 包括类装饰器, 属性装饰器, 方法装饰器

- 注: 为了让 vscode 支持 decorator 语法, 需要在 tsconfig.ts 中进行如下设置

```json
{
  "experimentalDecorators": true
}
```

参数：

- decoratorsBeforeExport：用于配置 export 语法是否在装饰器之前，默认值为 false，即装饰器不在 export 之前，否则反之。

```js
// decoratorsBeforeExport: false
export
@decorator
class A {}

// decoratorsBeforeExport: true
@decorator
export class A {}
```

- legacy：boolean, 默认是 false，同插件@babel/plugin-proposal-class-properties 的参数 legacy 的配置相同, 两个插件一般连着用, 配置如下：

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
}
```

#### @babel/plugin-transform-runtime

1、babel 在转译的过程中，对 syntax 的处理可能会使用到 helper 函数，对 api 的处理会引入 polyfill。

2、默认情况下，babel 在每个需要使用 helper 的地方都会定义一个 helper，导致最终的产物里有大量重复的 helper；引入 polyfill 时会直接修改全局变量及其原型，造成原型污染。

3、@babel/plugin-transform-runtime 的作用是将 helper 和 polyfill 都改为从一个统一的地方引入，并且引入的对象和全局变量是完全隔离的，这样解决了上面的两个问题。

4、配置如下：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "debug": true
      }
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3 // 指定 runtime-corejs 的版本，目前有 2 3 两个版本
      }
    ]
  ]
}
```

#### 配置 antd 按需加载

1、在`.babelrc`中设置如下配置：

```json
{
  "plugins": [
    [
      "import",
      {
        "libraryName": "antd",
        "libraryDirectory": "es",
        "style": "css"
      }
    ]
  ]
}
```

2、注意："style": "css" 需要设置成 css，否则 antd 样式将会与 webpack 中设置的 css 模块化配置产生冲突，导致 antd 按需加载失效。

3、产生冲突 css 模块化配置如下：

```js
{
  loader: "css-loader",
  options: {
    modules: {
      mode: "local",
      localIdentName: "[name]__[local]--[hash:base64:5]",
    },
    importLoaders: 1,
  },
},
```
