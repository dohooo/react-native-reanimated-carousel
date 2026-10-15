/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://rn-carousel.dev",
  generateRobotsTxt: true,
  exclude: ["*/_meta", "/404"],
  outDir: "out",
  robotsTxtOptions: {
    transformRobotsTxt: async (_config, robotsTxt) =>
      `${robotsTxt.trimEnd()}

# Docs for AI agents
# Index: https://rn-carousel.dev/llms.txt
# Full docs in one file: https://rn-carousel.dev/llms-full.txt
# Any page as Markdown: add .md to its URL, e.g. https://rn-carousel.dev/usage.md
`,
  },
};
