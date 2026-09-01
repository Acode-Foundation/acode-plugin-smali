const path = require('path');
const { packZip } = require('./dev/pack-zip');

function createPackZipPlugin(pack = packZip, logger = console) {
  return {
    apply(compiler) {
      compiler.hooks.done.tapPromise('pack-zip', async (stats) => {
        if (stats.hasErrors()) return;
        const outputFile = await pack();
        logger.log(`${path.basename(outputFile)} written.`);
      });
    },
  };
}

function createWebpackConfig(_environment, options) {
  const { mode = 'development' } = options;
  const rules = [
    {
      test: /\.(?:mjs|js|jsx)$/i,
      use: ['babel-loader'],
    },
    {
      test: /\.svg$/i,
      type: 'asset/inline',
    },
  ];

  const main = {
    mode,
    target: ['web', 'es5'],
    entry: {
      main: './src/main.js',
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
      globalObject: 'window',
    },
    module: {
      rules,
    },
    plugins: [createPackZipPlugin()],
  };

  return [main];
}

module.exports = createWebpackConfig;
module.exports.createPackZipPlugin = createPackZipPlugin;
