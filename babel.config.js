module.exports = (api) => {
  const supportsStaticESM = api.caller((caller) => Boolean(caller?.supportsStaticESM));

  return {
    presets: [
      [
        "@babel/preset-typescript",
        {
          allowNamespaces: true,
          isTSX: true,
          allExtensions: true,
        },
      ],
      [
        "@react-native/babel-preset",
        {
          disableImportExportTransform: supportsStaticESM,
        },
      ],
    ],
    plugins: [
      "@babel/plugin-syntax-typescript",
      "react-native-worklets/plugin",
      "@babel/plugin-syntax-dynamic-import",
    ],
  };
};
