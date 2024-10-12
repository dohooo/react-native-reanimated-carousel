/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://rn-carousel.dev",
  generateRobotsTxt: true,
  exclude: ["*/_meta"],
};
