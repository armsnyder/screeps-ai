module.exports = {
  entry: './src/main.ts',
  mode: 'production',
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
    ],
  },
  node: {
    Buffer: false,
    __dirname: false,
    __filename: false,
    console: true,
    global: true,
    process: false,
  },
  output: {
    filename: './main.js',
    libraryTarget: 'commonjs2',
    pathinfo: false,
  },
  resolve: {
    extensions: ['.js', '.ts', '.d.ts'],
  },
  target: 'node',
};
