const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const rootPak = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

module.exports = (api) => {
  api.cache(true);
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
