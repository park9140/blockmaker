var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./app.js",
    output: {
      path: __dirname + "/docs",
      filename: "bundle.js"
    },
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".jsx", ".js"]
    },
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        //{ test: /\.tsx?$/, loader: "ts-loader" }
      ]
    },
    devServer: {
      contentBase: path.join(__dirname, 'docs'),
      compress: true,
      port: 9000
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            template: './index.html',
            filename: './index.html' //relative to root of the application
        })
    ],
  };