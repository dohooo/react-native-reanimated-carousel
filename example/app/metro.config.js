const fs = require("fs");
const path = require("path");

const escape = require("escape-string-regexp");
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;
const defaultWatchFolders = config.watchFolders ?? [];
// const { createBlacklist } = require("metro-config");

const root = path.resolve(__dirname, "../..");
const rootPak = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const modules = [
  "@babel/runtime",
  "metro-runtime",
  "react-native-web",
  ...Object.keys({
    ...rootPak.dependencies,
    ...rootPak.peerDependencies,
  }),
];

module.exports = {
  ...config,

  projectRoot: __dirname,
  watchFolders: [...defaultWatchFolders, root],

  // Use the project root as cacheVersion so each worktree gets its own
  // Metro cache namespace. Without this, worktrees sharing /tmp/metro-cache/
  // can serve stale transforms containing another worktree's absolute paths.
  cacheVersion: root,

  // We need to make sure that only one version is loaded for peerDependencies
  // So we blacklist them at the root, and alias them to the versions in example's node_modules
  resolver: {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
    blockList: [new RegExp(`^${escape(path.join(root, "node_modules"))}\\/.*$`)],
    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, "node_modules", name);
      return acc;
    }, {}),
    unstable_enablePackageExports: false
  },

  transformer: {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
