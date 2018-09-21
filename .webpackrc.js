const path = require('path');
let webpack = require('webpack');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  externals: {
    '@antv/data-set': 'DataSet',
    bizcharts: 'BizCharts',
    rollbar: 'rollbar',
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
  },
  commons: [
    // new webpack.optimize.CommonsChunkPlugin({
    //   names: ['antd', 'vendor', 'bizcharts'],
    //   minChunks: Infinity
    // })
  ],
  extraBabelIncludes: ['node_modules/@antv'],
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableDynamicImport: true,
  es5ImcompatibleVersions: true,
  publicPath: '/',
  hash: true,
  proxy: {
    '/service': {
      target: 'http://localhost:8087',
      changeOrigin: true,
      pathRewrite: { '^/service': '' },
    },
    '/oauth': {
      target: 'http://116.228.77.183:25297',
      changeOrigin: true,
    },
    '/api': {
      target: 'http://116.228.77.183:25297',
      changeOrigin: true,
    },
    '/auth': {
      target: 'http://116.228.77.183:25297',
      changeOrigin: true,
    },
    '/artemis-sit': {
      target: 'http://116.228.77.183:25297',
      changeOrigin: true,
    },
  },
};