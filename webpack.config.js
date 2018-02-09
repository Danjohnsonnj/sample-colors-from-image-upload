var path = require('path');

var IS_PRODUCTION = process.env.NODE_ENV === 'production';

var scriptsPath = path.resolve(__dirname, 'dist');

var sitejs = ['./src/site.js'];

var sourceScripts = sitejs;

var config = {
  entry: sourceScripts,
  output: {
    path: scriptsPath,
    filename: 'site-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          path.resolve(__dirname, 'node_modules')
        ],
        loader: 'babel-loader',
        options: {
          presets: [
            [
              'env',
              {
                targets: {
                  browsers: [ 'last 2 versions' ]
                }
              }
            ]
          ],
          plugins: [ ]
        }
      }
    ]
  }
};

module.exports = config;