const path = require('path')
const outputPath = path.join(__dirname, 'dist')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const TerserPlugin = require('terser-webpack-plugin')  // 添加这行

module.exports = {
  target: 'web',
  mode: 'development',
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: outputPath
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    new CopyWebpackPlugin({ patterns: [{ from: 'public', to: outputPath }] }),
    new Dotenv({
      path: './.env', // 默认路径
      safe: true, // 加载 .env.example 文件并验证 .env 文件中的变量是否都存在
      systemvars: true, // 加载所有系统环境变量
      silent: true, // 隐藏警告和错误
      defaults: false // 不加载 .env.defaults 文件
    })
  ],
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: { chrome: 91 } }], '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              '@babel/plugin-proposal-class-properties',
              ['import', { libraryName: '@mui/material', libraryDirectory: 'esm', camel2DashComponentName: false }, 'material'],
              ['import', { libraryName: '@mui/icons-material', libraryDirectory: 'esm', camel2DashComponentName: false }, 'icons']
            ]
          }
        }
      },
      {
        test: /\.(less|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',
          'less-loader'
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        exclude: [
          /node_modules\/charenc\/README\.js/,
          /node_modules\/has-tostringtag\/test\/shams\/.*/,
          /node_modules\/has-symbols\/test\/shams\/.*/
        ],
      }),
    ],
  },
}
