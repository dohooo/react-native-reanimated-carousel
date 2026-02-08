const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const rootPak = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

module.exports = (api) => {
  // Cache must depend on the project root path so that different worktrees
  // (e.g. Conductor workspaces) don't share Babel transform caches.
  // With api.cache(true), Babel reuses cached transforms even when the
  // module-resolver alias points to a different absolute path.
  api.cache.using(() => root);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "@tamagui/babel-plugin",
      [
        "module-resolver",
        {
          extensions: [".tsx", ".ts", ".js", ".json"],
          alias: {
            // For development, we want to alias the library to the source
            [rootPak.name]: path.join(root, rootPak["react-native"]),
          },
        },
      ],
    ],
  };
};
