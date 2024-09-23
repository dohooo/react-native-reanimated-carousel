const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '../..');
const rootPak = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);

const demo = path.join(__dirname, '../demo');
const demoPak = JSON.parse(
  fs.readFileSync(path.join(demo, 'package.json'), 'utf8')
);

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            // For development, we want to alias the library to the source
            [rootPak.name]: path.join(root, rootPak['react-native']),
            [demoPak.name]: path.join(demo, demoPak['react-native']),
          },
        },
      ],
    ],
  };
};
