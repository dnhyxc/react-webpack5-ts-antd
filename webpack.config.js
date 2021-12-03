const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CleanCSSPlugin = require("less-plugin-clean-css");
// 控制台编译输出信息设置plugin
const friendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
// 每次编译时清除dist文件的内容
// const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// 编译进度条
// const ProgressBarPlugin = require("progress-bar-webpack-plugin");
// 打包时不不将注释提取到单独的文件中
// const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";

  return {
    entry: {
      app: "./src/index.tsx",
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "[name].[hash:8].bundle.js",
      chunkFilename: "[name].[hash:8].bundle.js",
      publicPath: "/",
    },
    module: {
      rules: [
        // 编译js、ts、tsx、jsx文件
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: [
            /**
             * 需将 thread-loader 放置在其他 loader 之前。放置在此 loader 之后的 loader 会在一个独立的 worker 池中运行。
             * 使用时，需将此 loader 放置在其他 loader 之前。放置在此 loader 之后的 loader 会在一个独立的 worker 池中运行。
             * 在 worker 池中运行的 loader 是受到限制的。例如：
             *   - 这些 loader 不能生成新的文件。
             *   - 这些 loader 不能使用自定义的 loader API（也就是说，不能通过插件来自定义）。
             *   - 这些 loader 无法获取 webpack 的配置。
             *   - 每个 worker 都是一个独立的 node.js 进程，其开销大约为 600ms 左右。同时会限制跨进程的数据交换。
             * 请仅在耗时的操作中使用此 loader！
             */
            "thread-loader",
            {
              loader: "babel-loader",
              options: {
                cacheDirectory: true,
                include: path.resolve(__dirname, "./src"),
              },
            },
          ],
        },
        // 编译css, less
        {
          test: /\.css$/,
          use: [
            {
              loader: isDev ? "style-loader" : MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: isDev ? "style-loader" : MiniCssExtractPlugin.loader,
            },
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
            {
              loader: "postcss-loader",
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  /**
                   * 配置paths用于表明less文件的寻找顺序。
                   * 即当要寻找某个less文件时，先会在统计目录下寻找，找不再到src、node_modules/antd下寻找，如果再找不到，就会报错。
                   */
                  paths: [
                    path.resolve(__dirname, "./src"),
                    path.resolve(__dirname, "./node_modules/antd"),
                  ],
                  // 生产环境，对输出的css文件进行压缩
                  plugins: [
                    isDev ? "" : new CleanCSSPlugin({ advanced: true }),
                  ].filter(Boolean),
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
        // 编译图片资源
        {
          test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
          type: "asset/resource",
          generator: {
            filename: "img/[name].[hash:8].[ext]",
          },
        },
        // 编译字体与svg
        {
          test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
          type: "asset/inline",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "qiankun-react-main",
        template: path.resolve(__dirname, "./public/index.html"),
        filename: "index.html",
      }),
      // css 单独打包
      new MiniCssExtractPlugin({
        filename: "[name].[hash:8].css",
        chunkFilename: "[name].[hash:8].css",
      }),
      // 每次构建时都清除dist包内容
      // new CleanWebpackPlugin(),
      new friendlyErrorsWebpackPlugin(),
      // 设置打包进度条
      // new ProgressBarPlugin({
      //   complete: "█",
      // }),
    ],
    resolve: {
      // 设置路径别名
      alias: {
        "@": path.resolve(__dirname, "src/"),
      },
      /**
       * 在导入语句没带文件后缀时，webpack会自动带上后缀去尝试访问文件是否存在。
       * resolve.extensions用于配置在尝试过程中用到的后缀列表
       */
      extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    },
    optimization: {
      minimize: isDev ? true : false,
      minimizer: [
        // 将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
        new CssMinimizerPlugin(),
        //不将注释提取到单独的文件中
        // new TerserPlugin({
        //   extractComments: false,
        // }),
      ],
      /**
       * 配置长缓存，长效缓存是浏览器层面的缓存，
       * Webpack通过optimization的splitChunks和runtimeChunk的配置，
       * 让编译输出的文件具有稳定的hash名称，从而让浏览器能长期有效、安全的复用缓存，达到加速页面加载的效果。
       */
      runtimeChunk: {
        name: "manifest",
      },
      splitChunks: {
        cacheGroups: {
          styles: {
            name: "styles",
            test: /\.css$/,
            chunks: "all",
            enforce: true,
          },
        },
      },
    },
    // 缓存生成的 webpack 模块和 chunk，来改善构建速度
    cache: {
      // 默认type是memory也就是缓存放到内存中
      type: "filesystem",
      /**
       * cache.buildDependencies 是一个针对构建的额外代码依赖的数组对象。
       * webpack 将使用这些项和所有依赖项的哈希值来使文件系统缓存失效。
       * 设置 cache.buildDependencies.config: [__filename] 来获取最新配置以及所有依赖项。
       */
      buildDependencies: {
        config: [__filename],
      },
    },
    // 热更新
    devServer: {
      proxy: {
        "/api": {
          target: "https://dnhyxc.gitee.io",
          secure: false, // 不设置验证，使其支持https
          // pathRewrite: {
          //   "^api": "", // 路径重写，将api开头的全部替换成 '' 空字符串
          // },
        },
      },
      // history路由需要设置这个参数为true，要不你刷新页面会空白屏
      historyApiFallback: true,
      static: path.join(__dirname, "./dist"),
      open: false,
      hot: true,
      port: 9011,
      compress: true, // 开启gzip压缩
      client: {
        progress: false, // 在浏览器端打印编译速度
      },
    },
    // 精简控制台编译输出信息
    stats: "errors-only",
    devtool: !isDev ? "source-map" : "inline-source-map",
    // 清除打包警告 webpack 的性能提示
    performance: {
      hints: "warning",
      //入口起点的最大体积
      maxEntrypointSize: 50000000,
      //生成文件的最大体积
      maxAssetSize: 30000000,
      //只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith(".js");
      },
    },
    mode: "development",
  };
};
