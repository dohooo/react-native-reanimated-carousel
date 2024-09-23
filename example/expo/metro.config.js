const path = require('path');
const fs = require('fs');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const root = path.resolve(__dirname, '../..');
const rootPak = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);

const demo = path.join(__dirname, '../demo');
const demoPak = JSON.parse(
  fs.readFileSync(path.join(demo, 'package.json'), 'utf8')
);

const modules = [
  '@babel/runtime',
  'metro-runtime',
  ...Object.keys({
    ...rootPak.dependencies,
    ...rootPak.peerDependencies,
    ...demoPak.devDependencies,
    ...demoPak.peerDependencies,
  }),
];

module.exports = {
  projectRoot: __dirname,
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we blacklist them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blacklistRE: exclusionList([
      new RegExp(`^${escape(path.join(root, 'node_modules'))}\\/.*$`),
      new RegExp(`^${escape(path.join(demo, 'node_modules'))}\\/.*$`),
    ]),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
