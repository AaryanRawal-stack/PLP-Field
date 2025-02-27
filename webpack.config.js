const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Detect if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // Set mode based on environment
  mode: isProduction ? 'production' : 'development',

  entry: {
    background: './src/background/background.js',
    'content-script': './src/content/content-script.js',
    'kodepay-script': './src/content/kodepay-script.js',
    popup: './src/ui/popup/popup-main.js',
    options: './src/ui/options/options-main.js'
  },
  

  // Output configuration
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },

  // Use source maps suitable for Manifest V3 (no eval())
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',

  // Loaders for Vue, JS, and CSS
  module: {
    rules: [
      // Process Vue Single File Components
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // Process JavaScript files with Babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      // Process CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  // Resolve .js and .vue files, alias Vue to full build
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  },

  plugins: [
    // Enable Vue SFC support
    new VueLoaderPlugin(),

    // Copy static assets from /public, ignoring HTML (handled by HtmlWebpackPlugin)
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/*.html']
          }
        }
      ]
    }),

    // Generate popup.html with the popup bundle injected
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: 'public/popup.html',
      chunks: ['popup']
    }),

    // Generate options.html with the options bundle injected
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: 'public/options.html',
      chunks: ['options']
    }),

    // Generate index.html (if needed) without specific bundles
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/index.html',
      chunks: []
    })
  ],

  // DevServer for local development (optional for Chrome extensions)
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    hot: true,
    open: true
  }
};
