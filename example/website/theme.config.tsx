import React from "react";

import type { DocsThemeConfig } from "nextra-theme-docs";

import { MarkdownLinks, useHeadTags, useSeoProps } from "./components/PageMeta";

const config: DocsThemeConfig = {
  logo: <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
    <img className="rnrc-logo" src="/site-icon.png" alt="RNRC Logo" width={24} height={24} style={{ marginRight: "8px" }} />
    <span style={{ fontWeight: 700, fontSize: "22px" }}>RNRC</span>
  </div>,
  project: {
    link: "https://github.com/dohooo/react-native-reanimated-carousel",
  },
  chat: {
    link: "https://discord.gg/qB9h3kGNas",
  },
  docsRepositoryBase:
    "https://github.com/dohooo/react-native-reanimated-carousel/tree/main/example/website",
  footer: {
    text: `Copyright © ${new Date().getFullYear()} Caspian. Built with Nextra.`,
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
  },
  toc: {
    extraContent: MarkdownLinks,
  },
  darkMode: true,
  useNextSeoProps: useSeoProps,
  head: useHeadTags,
};

export default config;
