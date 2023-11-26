import React from "react";

import type { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
    <img src="/site-icon.png" alt="RNRC Logo" width={24} height={24} style={{ marginRight: "8px" }} />
    <span style={{ fontWeight: 700, fontSize: "22px" }}>RNRC</span>
  </div>,
  project: {
    link: "https://github.com/dohooo/react-native-reanimated-carousel",
  },
  chat: {
    link: "https://discord.gg/qB9h3kGNas",
  },
  docsRepositoryBase: "https://github.com/shuding/nextra-docs-template",
  footer: {
    text: "Copyright © 2023 Caspian. Built with Nextra.",
  },
  darkMode: true,
  useNextSeoProps() {
    return {
      titleTemplate: "%s – RNRC",
    };
  },
  head: (
    <>
      <link rel="shortcut icon" href="/site-icon.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="react-native-reanimated-carousel" />
      <meta property="og:description" content="A performant carousel for React Native powered by Reanimated." />
    </>
  ),
};

export default config;
