import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/peer_chat/",
  title: "peerChat",
  description: "Serverless P2P chat. No accounts. No servers. Ever.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/docs/getting-started" },
      { text: "Roadmap", link: "/docs/roadmap" },
      {
        text: "Download",
        link: "https://github.com/korir248/peer_chat/releases",
      },
    ],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "What is peerChat?", link: "/docs/what-is-peerchat" },
          { text: "Installation", link: "/docs/getting-started" },
          { text: "Quick Start", link: "/docs/quick-start" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "Local Network Chat", link: "/docs/local-network" },
          { text: "Global P2P Chat", link: "/docs/global-p2p" },
        ],
      },
      {
        text: "Project",
        items: [
          { text: "Roadmap", link: "/docs/roadmap" },
          { text: "FAQ", link: "/docs/faq" },
          { text: "Contributing", link: "/docs/contributing" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/korir248/peer_chat" },
    ],

    footer: {
      message:
        "Documentation licensed under CC BY 4.0. App licensed under AGPL-3.0.",
      copyright: "Copyright © 2025 Eugene Korir",
    },
  },
});
