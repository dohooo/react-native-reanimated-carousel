const { join } = require("path");
const dotenv = require("dotenv");

const isDev = process.env.NODE_ENV === "development";
const env = dotenv.config({
  path: join(__dirname, `.env.${isDev ? "development" : "production"}`),
}).parsed;

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

module.exports = withNextra({
  env,
});
