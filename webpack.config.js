var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
// var segmentKey = require('./segmentKey')
var webpack = require('webpack')
var path = require('path')
var net = require('net')
var fs = require('fs')

console.log('dev config')

function config (env) {
  return {
    entry: {
      app: './lib/client/index.js',
      vendor: [
        'lodash',
        'brace',
        'firebase',
        'auto-yield-delegate',
        'js-analyse'
      ]
    },
    output: {
      filename: '[hash].[name].js',
      path: path.resolve(__dirname, 'public'),
      publicPath: '/public/'
    },
    resolve: {
      modules: [path.resolve(__dirname, 'lib'), 'node_modules']
    },
    module: {
      loaders: [
        {
          test: /\.worker.js$/,
          loaders: ['worker-loader', 'babel-loader']
        },
        {
          test: /.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
        },
        {
          test: /\.md$/,
          loaders: ['html-loader', 'markdown-loader']
        }
      ]
    },
    target: 'web',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"dev"',
          TRACKING_CODE: null,
          CLOUD_FUNCTIONS: '"https://artbot-dev.firebaseapp.com/api"'
        }
      }),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'] // Specify the common bundle's name.
      }),
      new HtmlWebpackPlugin({
        title: 'PixelBots Dev',
        cache: true,
        template: 'my-index.html' // Load a custom template (ejs by default see the FAQ for details)
      })
    ],
    node: {
      module: 'empty',
      console: 'mock'
    },
    externals: {
      net: net,
      fs: fs
    },
    devtool: 'eval-source-map',
    devServer: {
      hot: true,
      contentBase: path.join(__dirname, 'public'),
      compress: true,
      historyApiFallback: {
        index: '/public/index.html'
      },
      overlay: true
      // index: '/public/index.html'
      // publicPath: '/public/'
      // index: '/public/index.html'
      // disableHostCheck: true
      // historyApiFallback: {
      //   rewrites: [
      //     {
      //       from: /([\d\w\-\.]*)(\.js$|\.json$)/,
      //       to: context => '/' + context.match[0]
      //     },
      //     {
      //       from: /([\d\w]*\.)([\d\w]*\.)([\d\w\-]*)(\.js$|\.json$)/,
      //       to: context => '/' + console.log('here\n\n\n', context)
      //     }
      //   ],
      //   index: '/index.html'
      // }
    }
  }
}

// new WebpackDevServer(webpack(config()), {}).listen(8080)

module.exports = config
