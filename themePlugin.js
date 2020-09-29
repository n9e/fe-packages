
const path = require('path');
const AntDesignThemePlugin = require('antd-theme-webpack-plugin');

const cwd = process.cwd();
const options = {
  antDir: path.join(cwd, '/node_modules/antd'),
  stylesDir: path.join(cwd, '/src'),
  varFile: path.join(cwd, '/src/variables.less'),
  mainLessFile: path.join(cwd, '/src/style.less'),
  themeVariables: ['@primary-color'],
  indexFileName: 'index.html',
  generateOnce: false,
  lessUrl: '',
};

if (process.env.NODE_ENV === 'production') {
  options.publicPath = `/${process.env.APP_NAME}/`;
}

module.exports = new AntDesignThemePlugin(options);
